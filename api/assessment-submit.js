/**
 * POST /api/assessment-submit
 *
 * Save assessment results to database and generate AI content
 * Called when user completes the assessment (before email capture)
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
 *   shareableUrl: "/report.html?id={token}",
 *   expiresAt: ISO timestamp,
 *   executiveSummary: "AI-generated summary text",
 *   scores: { scoring results },
 *   message: "Assessment saved successfully"
 * }
 */

const { calculateScore, calculateScoreWithContre } = require('../scoring-algorithm');
const { generateExecutiveSummary, generateFullAnalysis } = require('./ai-integration');
const { calculateConservativeROI } = require('./roi-calculator');
const { supabase } = require('./db');

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

    if (!companyInfo.company_name || !companyInfo.agent_count ||
        !companyInfo.monthly_deals || !companyInfo.location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required company information fields'
      });
    }

    console.log(`[ASSESSMENT] Processing for ${companyInfo.company_name}`);

    // Calculate scores using scoring-algorithm.js
    const scoreResults = calculateScore(responses);
    console.log(`[SCORING] Overall score: ${scoreResults.totalScore}/100 (${scoreResults.percentage}%)`);

    // Calculate ContRE score comparison
    const contreComparison = calculateScoreWithContre(scoreResults);
    console.log(`[CONTRE] Score with ContRE: ${contreComparison.withContre.totalScore}/100 (improvement: +${contreComparison.improvement.totalPoints} points)`);

    // Calculate conservative ROI projections
    const roiAnalysis = calculateConservativeROI({
      agentCount: parseInt(companyInfo.agent_count) || 75,
      responses: responses
    });
    console.log(`[ROI] Conservative annual value: $${roiAnalysis.bottomLine.totalAnnualValue}, ROI: ${roiAnalysis.bottomLine.roi}`);

    // Prepare assessment data structure for AI generation
    const assessmentData = {
      companyName: companyInfo.company_name,
      companySize: companyInfo.agent_count,
      agentCount: parseInt(companyInfo.agent_count) || 75, // Numeric for calculations
      monthlyTransactions: companyInfo.monthly_deals,
      primaryMarket: companyInfo.location,
      overallScore: scoreResults.totalScore,
      riskLevel: scoreResults.riskProfile,
      categoryScores: [
        {
          category: 'Deal Failure Reality',
          score: scoreResults.categoryBreakdown.dealFailureReality.score,
          maxScore: scoreResults.categoryBreakdown.dealFailureReality.max,
          percentage: scoreResults.categoryBreakdown.dealFailureReality.percentage
        },
        {
          category: 'Deadline Visibility',
          score: scoreResults.categoryBreakdown.deadlineVisibility.score,
          maxScore: scoreResults.categoryBreakdown.deadlineVisibility.max,
          percentage: scoreResults.categoryBreakdown.deadlineVisibility.percentage
        },
        {
          category: 'Document Intelligence',
          score: scoreResults.categoryBreakdown.documentIntelligence.score,
          maxScore: scoreResults.categoryBreakdown.documentIntelligence.max,
          percentage: scoreResults.categoryBreakdown.documentIntelligence.percentage
        },
        {
          category: 'Agent Knowledge',
          score: scoreResults.categoryBreakdown.agentKnowledge.score,
          maxScore: scoreResults.categoryBreakdown.agentKnowledge.max,
          percentage: scoreResults.categoryBreakdown.agentKnowledge.percentage
        },
        {
          category: 'Client Experience & Liability',
          score: scoreResults.categoryBreakdown.clientExperienceLiability.score,
          maxScore: scoreResults.categoryBreakdown.clientExperienceLiability.max,
          percentage: scoreResults.categoryBreakdown.clientExperienceLiability.percentage
        },
        {
          category: 'E&O Risk',
          score: scoreResults.categoryBreakdown.eoRiskProtection.score,
          maxScore: scoreResults.categoryBreakdown.eoRiskProtection.max,
          percentage: scoreResults.categoryBreakdown.eoRiskProtection.percentage
        }
      ],
      responses: scoreResults.questionResults.map(qr => ({
        questionId: qr.questionId,
        questionText: getQuestionText(qr.questionId),
        answer: qr.response,
        pointsEarned: qr.score
      })),
      // NEW: Add ContRE analysis for AI to use
      contreAnalysis: {
        scoreComparison: contreComparison,
        roiProjection: roiAnalysis,
        targetMarketFit: roiAnalysis.bottomLine.targetMarketFit,
        keyMessage: roiAnalysis.bottomLine.isPositiveROI
          ? `At ${companyInfo.agent_count} agents, ContRE delivers ${roiAnalysis.bottomLine.roi} ROI through conservative time savings and risk mitigation`
          : `ContRE's primary value at your scale is risk mitigation and operational excellence`
      }
    };

    // Generate shareable token and expiration
    const crypto = require('crypto');
    const shareableToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    // Convert percentile rank string to integer for database
    // e.g., "95th percentile" -> 95, "Bottom 10%" -> 10
    const percentileValue = scoreResults.percentage; // Use the percentage score as percentile

    // Save to database WITHOUT AI content first (we'll generate it async)
    console.log('[DB] Saving assessment...');
    const { data: assessment, error: insertError } = await supabase
      .from('assessments')
      .insert({
        company_name: companyInfo.company_name,
        company_size: companyInfo.agent_count,
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
        completed_at: null // Will be set when email is captured
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
    console.log(`[DB] Assessment saved with ID: ${assessmentId}`);

    // Generate AI content (WAIT for it to complete before responding)
    // This is necessary in serverless environments like Vercel where the function
    // may be killed after the response is sent
    console.log('[AI] Starting AI content generation...');
    try {
      const [executiveSummary, fullAnalysis] = await Promise.all([
        generateExecutiveSummary(assessmentData),
        generateFullAnalysis(assessmentData)
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

    console.log('[SUCCESS] Assessment processing complete');

    // Success response (AI content will be generated in background)
    res.status(200).json({
      success: true,
      assessmentId,
      shareableToken,
      shareableUrl: `/report.html?id=${shareableToken}`,
      expiresAt: expiresAt.toISOString(),
      scores: scoreResults,
      message: 'Assessment saved successfully. AI report is being generated.'
    });

  } catch (error) {
    console.error('Error in assessment-submit:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to save assessment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to get human-readable question text from question ID
 */
function getQuestionText(questionId) {
  const questionMap = {
    // Deal Failure Reality
    'deals_fallen_through': 'In the last 12 months, how many deals fell through AFTER being under contract?',
    'failed_deal_causes': 'Of those failed deals, what percentage were due to missed deadlines, inspection issues, or document problems?',
    'lost_commission_value': 'Based on your average commission per deal, what\'s the approximate dollar value of lost commissions from failed deals in the last 12 months?',

    // Deadline Visibility Gap
    'inspection_deadlines_visibility': 'Right now, without looking anything up, how many of your agents have inspection deadlines in the next 7 days?',
    'at_risk_deals': 'How many deals closing THIS MONTH could be at risk due to financing delays or appraisal issues?',
    'addendum_deadline_handling': 'When an addendum changes a closing date, what happens to all the related deadlines (inspection, financing, appraisal)?',

    // Document Intelligence
    'date_extraction_time': 'When a TC uploads a purchase agreement, how long until all critical dates are in your tracking system?',
    'inspection_deadline_check': 'How do you know if an inspection deadline is too short for your market?',
    'document_conflict_detection': 'When HOA documents contradict something in the purchase agreement (e.g., rental restrictions), how do you catch it?',

    // Agent Knowledge & Consistency
    'after_hours_policy_access': 'At 11 PM on a Saturday, can your agents instantly find your brokerage\'s policy on dual agency disclosure / commission splits / required forms?',
    'agent_consistency': 'How many different ways do your agents handle the same situation (e.g., writing up dual agency)?',
    'policy_update_compliance': 'When you update a brokerage policy, how do you ensure compliance?',

    // Client Experience & Liability
    'after_hours_client_support': 'How do your clients get answers to transaction questions at 10 PM on a Sunday?',
    'client_document_understanding': 'What percentage of your clients actually understand what they\'re signing?',
    'closing_delays': 'How often do document/paperwork issues delay your closings?',

    // E&O Risk & Protection
    'eo_claims_history': 'E&O claims or near-misses in the last 2 years?',
    'liability_risk_awareness': 'Do you know which of your current transactions have the highest liability risk?'
  };

  return questionMap[questionId] || questionId;
}
