/**
 * POST /api/agents-assessment-submit
 *
 * Save agent assessment results to database and generate AI content
 * Called when agent completes the assessment (before email capture)
 *
 * Request body:
 * {
 *   companyInfo: { company_name, agent_count, monthly_deals, location },
 *   responses: { question_id: answer, ... },
 *   timestamp: ISO string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   assessmentId: "uuid",
 *   shareableToken: "uuid",
 *   shareableUrl: "/agents-report.html?id={token}",
 *   expiresAt: ISO timestamp,
 *   executiveSummary: "AI-generated summary text",
 *   scores: { scoring results },
 *   message: "Assessment saved successfully"
 * }
 */

const { calculateScore, calculateScoreWithContre } = require('../agents-scoring-algorithm');
const { generateExecutiveSummary, generateFullAnalysis } = require('./ai-integration');
const { calculateConservativeROI } = require('./agents-roi-calculator');
const { supabase } = require('./db');
const { generateExecutiveSummaryPrompt, generateFullAnalysisPrompt } = require('./agents-ai-prompts');

module.exports = async (req, res) => {
  // Enable CORS for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const { companyInfo, responses, timestamp } = req.body;

    // Validation: Check required fields
    if (!companyInfo || !responses) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyInfo or responses'
      });
    }

    if (!companyInfo.company_name || !companyInfo.monthly_deals || !companyInfo.location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required agent information fields'
      });
    }

    console.log(`[AGENT-ASSESSMENT] Processing for ${companyInfo.company_name}`);

    // Calculate scores using agents-scoring-algorithm.js
    const scoreResults = calculateScore(responses);
    console.log(`[SCORING] Overall score: ${scoreResults.totalScore}/100 (${scoreResults.percentage}%)`);

    // Calculate ContRE score comparison
    const contreComparison = calculateScoreWithContre(scoreResults);
    console.log(`[CONTRE] Score with ContRE: ${contreComparison.withContre.totalScore}/100 (improvement: +${contreComparison.improvement.totalPoints} points)`);

    // Calculate conservative ROI projections
    const roiAnalysis = calculateConservativeROI({
      monthlyTransactions: parseInt(companyInfo.monthly_deals) || 3,
      responses: responses
    });
    console.log(`[ROI] Conservative annual value: $${roiAnalysis.bottomLine.totalAnnualValue}, ROI: ${roiAnalysis.bottomLine.roi}`);

    // Prepare assessment data structure for AI generation
    const assessmentData = {
      companyName: companyInfo.company_name,
      companySize: "Individual Agent", // Agents don't have a team size
      monthlyTransactions: companyInfo.monthly_deals,
      primaryMarket: companyInfo.location,
      overallScore: scoreResults.totalScore,
      riskLevel: scoreResults.riskProfile,
      categoryScores: [
        {
          category: 'Process Efficiency',
          score: scoreResults.categoryBreakdown.processEfficiency.score,
          maxScore: scoreResults.categoryBreakdown.processEfficiency.max,
          percentage: scoreResults.categoryBreakdown.processEfficiency.percentage
        },
        {
          category: 'Risk Management',
          score: scoreResults.categoryBreakdown.riskManagement.score,
          maxScore: scoreResults.categoryBreakdown.riskManagement.max,
          percentage: scoreResults.categoryBreakdown.riskManagement.percentage
        },
        {
          category: 'Client Experience',
          score: scoreResults.categoryBreakdown.clientExperience.score,
          maxScore: scoreResults.categoryBreakdown.clientExperience.max,
          percentage: scoreResults.categoryBreakdown.clientExperience.percentage
        }
      ],
      responses: scoreResults.questionResults.map(qr => ({
        questionId: qr.questionId,
        questionText: getQuestionText(qr.questionId),
        answer: qr.response,
        pointsEarned: qr.score
      })),
      // Add ContRE analysis for AI to use
      contreAnalysis: {
        scoreComparison: contreComparison,
        roiProjection: roiAnalysis,
        targetMarketFit: roiAnalysis.bottomLine.targetMarketFit,
        keyMessage: roiAnalysis.bottomLine.isPositiveROI
          ? `At ${companyInfo.monthly_deals} transactions/month, ContRE delivers ${roiAnalysis.bottomLine.roi} ROI through conservative time savings and risk mitigation`
          : `ContRE's primary value at your volume is risk protection and peace of mind`
      }
    };

    // Generate shareable token and expiration
    const crypto = require('crypto');
    const shareableToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    // Convert percentile rank to integer for database
    const percentileValue = scoreResults.percentage; // Use the percentage score as percentile

    // Save to database WITHOUT AI content first (we'll generate it async)
    console.log('[DB] Saving agent assessment...');
    const { data: assessment, error: insertError } = await supabase
      .from('assessments')
      .insert({
        company_name: companyInfo.company_name,
        company_size: "Individual Agent",
        monthly_transactions: companyInfo.monthly_deals,
        primary_market: companyInfo.location,
        overall_score: scoreResults.totalScore,
        risk_level: scoreResults.riskProfile,
        percentile: percentileValue,
        shareable_token: shareableToken,
        token_expires_at: expiresAt.toISOString(),
        ai_executive_summary: null, // Will be generated async
        ai_full_analysis: null, // Will be generated async
        created_at: timestamp || new Date().toISOString(),
        completed_at: null, // Will be set when email is captured
        assessment_type: 'agent' // IMPORTANT: Mark this as an agent assessment
      })
      .select()
      .single();

    if (insertError) {
      console.error('[DB INSERT ERROR] Full error:', JSON.stringify(insertError, null, 2));
      console.error('[DB INSERT ERROR] Error message:', insertError.message);
      console.error('[DB INSERT ERROR] Error code:', insertError.code);
      console.error('[DB INSERT ERROR] Error details:', insertError.details);
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    const assessmentId = assessment.id;
    console.log(`[DB] Agent assessment saved with ID: ${assessmentId}`);

    // Generate AI content (WAIT for it to complete before responding)
    console.log('[AI] Starting AI content generation with agent-specific prompts...');
    try {
      // Use agent-specific prompts
      const executiveSummaryPrompt = generateExecutiveSummaryPrompt(assessmentData);
      const fullAnalysisPrompt = generateFullAnalysisPrompt(assessmentData);

      const [executiveSummary, fullAnalysis] = await Promise.all([
        generateExecutiveSummary(assessmentData, executiveSummaryPrompt),
        generateFullAnalysis(assessmentData, fullAnalysisPrompt)
      ]);

      console.log('[AI] Content generation complete, updating assessment...');

      // Update the assessment with AI content
      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          ai_executive_summary: executiveSummary,
          ai_full_analysis: fullAnalysis
        })
        .eq('id', assessmentId);

      if (updateError) {
        console.error('[AI UPDATE ERROR]:', updateError.message);
      } else {
        console.log('[AI] Assessment updated with AI content');
      }
    } catch (aiError) {
      console.error('[AI ERROR] Failed to generate content:', aiError.message);
      console.error('[AI ERROR] Stack:', aiError.stack);
      // Update with fallback summary - don't fail the whole request
      await supabase
        .from('assessments')
        .update({
          ai_executive_summary: scoreResults.profileSummary
        })
        .eq('id', assessmentId);
    }

    // Save category scores
    const categoryScoresData = assessmentData.categoryScores.map(cat => ({
      assessment_id: assessmentId,
      category: cat.category,
      score: cat.score,
      max_score: cat.maxScore,
      percentage: cat.percentage
    }));

    const { error: scoresError } = await supabase
      .from('scores')
      .insert(categoryScoresData);

    if (scoresError) {
      console.error('[DB] Failed to save scores:', scoresError.message);
      // Non-critical, continue
    }

    // Save individual responses
    const responsesData = assessmentData.responses.map(r => ({
      assessment_id: assessmentId,
      question_id: r.questionId,
      question_text: r.questionText,
      answer: r.answer,
      points_earned: r.pointsEarned
    }));

    const { error: responsesError } = await supabase
      .from('responses')
      .insert(responsesData);

    if (responsesError) {
      console.error('[DB] Failed to save responses:', responsesError.message);
      // Non-critical, continue
    }

    // Save identified gaps (low-scoring areas)
    const gaps = scoreResults.questionResults
      .filter(qr => qr.score <= qr.maxScore * 0.5) // 50% or lower
      .map(qr => ({
        assessment_id: assessmentId,
        question_id: qr.questionId,
        question_text: getQuestionText(qr.questionId),
        current_answer: qr.response,
        ai_optimized_answer: qr.aiOptimized,
        points_lost: qr.maxScore - qr.score,
        severity: qr.score === 0 ? 'CRITICAL' : qr.score <= qr.maxScore * 0.3 ? 'HIGH' : 'MEDIUM'
      }));

    if (gaps.length > 0) {
      const { error: gapsError } = await supabase
        .from('gaps')
        .insert(gaps);

      if (gapsError) {
        console.error('[DB] Failed to save gaps:', gapsError.message);
        // Non-critical, continue
      }
    }

    console.log('[SUCCESS] Agent assessment processing complete');

    // Success response
    res.status(200).json({
      success: true,
      assessmentId,
      shareableToken,
      shareableUrl: `/agents-report.html?id=${shareableToken}`,
      expiresAt: expiresAt.toISOString(),
      scores: scoreResults,
      message: 'Assessment saved successfully. AI report is being generated.'
    });

  } catch (error) {
    console.error('Error in agents-assessment-submit:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to save assessment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to get human-readable question text from question ID (Agent version)
 */
function getQuestionText(questionId) {
  const questionMap = {
    'deadline_tracking': 'How do you track contingency deadlines when some are business days and others are calendar days?',
    'client_timeline': 'Do you provide clients a detailed timeline at the start showing all critical dates and what happens when?',
    'after_hours_communication': 'When clients have questions about the transaction at 8pm or on weekends, how do they get answers?',
    'cross_document_analysis': 'How do you identify conflicts between the purchase agreement, HOA documents, inspection reports, and title work?',
    'document_review_thoroughness': 'What percentage of the time do you read ALL documents thoroughly in your transactions?',
    'broker_oversight': 'Does your broker or TC review every document in your transactions for compliance issues and potential errors before you proceed?',
    'issue_communication': 'How do you relay concerns from HOA restrictions, title issues, or inspection findings to your clients?',
    'technology_advantage': 'What technology do you use that your competitors don\'t to keep clients informed and confident throughout the transaction?',
    'client_retention': 'What percentage of your business comes from repeat clients and their referrals?',
    'transaction_failures': 'Have you ever experienced any of the following?'
  };

  return questionMap[questionId] || questionId;
}
