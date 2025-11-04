/**
 * POST /api/assessment-submit
 *
 * Save assessment results to database
 * Called when user completes the assessment (before email capture)
 *
 * Request body:
 * {
 *   companyName: string,
 *   companySize: string,
 *   monthlyTransactions: string,
 *   primaryMarket: string,
 *   overallScore: number,
 *   riskLevel: string,
 *   percentile: number,
 *   categoryScores: array,
 *   responses: array,
 *   criticalGaps: array
 * }
 *
 * Response:
 * {
 *   success: true,
 *   assessmentId: "uuid",
 *   message: "Assessment saved successfully"
 * }
 */

const { saveAssessment } = require('./db');
const { assessmentQuestions } = require('../CORRECT_QUESTIONS');

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
    const { companyInfo, responses, scores, timestamp } = req.body;

    // Validation: Check required fields
    if (!companyInfo || !responses || !scores) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyInfo, responses, or scores'
      });
    }

    if (!companyInfo.company_name || !companyInfo.agent_count ||
        !companyInfo.monthly_deals || !companyInfo.location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required company information fields'
      });
    }

    // Validate score range
    if (scores.overall < 0 || scores.overall > 100) {
      return res.status(400).json({
        success: false,
        error: 'Overall score must be between 0 and 100'
      });
    }

    // Validate risk level
    const validRiskLevels = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'];
    if (!validRiskLevels.includes(scores.riskLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid risk level'
      });
    }

    // Extract percentile number from string like "Top 50%" -> 50
    const percentileMatch = scores.percentile.match(/\d+/);
    const percentileNumber = percentileMatch ? parseInt(percentileMatch[0]) : null;

    // Transform data for database
    const assessmentData = {
      companyName: companyInfo.company_name,
      companySize: companyInfo.agent_count,
      monthlyTransactions: companyInfo.monthly_deals,
      primaryMarket: companyInfo.location,
      overallScore: scores.overall,
      riskLevel: scores.riskLevel,
      percentile: percentileNumber,
      categoryScores: [
        { category: 'Transaction Oversight', score: scores.transactionOversight, maxScore: 100, percentage: Math.round((scores.transactionOversight / 100) * 100) },
        { category: 'Operational Systems', score: scores.operationalSystems, maxScore: 100, percentage: Math.round((scores.operationalSystems / 100) * 100) },
        { category: 'Knowledge Management', score: scores.knowledgeManagement, maxScore: 100, percentage: Math.round((scores.knowledgeManagement / 100) * 100) },
        { category: 'Client Experience', score: scores.clientExperience, maxScore: 100, percentage: Math.round((scores.clientExperience / 100) * 100) },
        { category: 'Risk Management', score: scores.riskManagement, maxScore: 67, percentage: Math.round((scores.riskManagement / 67) * 100) }
      ],
      responses: Object.entries(responses)
        .filter(([questionId]) => !['company_name', 'agent_count', 'monthly_deals', 'location'].includes(questionId))
        .map(([questionId, answer]) => {
          // Find the question to get scoring info
          let pointsEarned = 0;
          let questionText = questionId;

          for (const [categoryKey, categoryData] of Object.entries(assessmentQuestions)) {
            if (categoryKey === 'companyInfo') continue;
            const question = categoryData.questions.find(q => q.id === questionId);
            if (question) {
              questionText = question.label;
              if (question.scoring && question.scoring[answer]) {
                pointsEarned = question.scoring[answer];
              }
              break;
            }
          }

          return {
            questionId,
            questionText,
            answer,
            pointsEarned
          };
        }),
      timestamp
    };

    // Save to database
    const assessmentId = await saveAssessment(assessmentData);

    // Success response
    res.status(200).json({
      success: true,
      assessmentId,
      message: 'Assessment saved successfully'
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
