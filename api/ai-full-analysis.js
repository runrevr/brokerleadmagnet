/**
 * GET /api/ai-full-analysis?id={uuid}
 *
 * Generate comprehensive AI analysis for assessment
 * This is TIER 2 - only available after email capture
 *
 * Returns full AI-powered insights including:
 * - Gap analysis
 * - 90-day roadmap
 * - Competitive positioning
 * - Financial impact modeling
 * - Specific recommendations
 *
 * Query params:
 * - id: Assessment UUID
 *
 * Response:
 * {
 *   success: true,
 *   analysis: {
 *     gapAnalysis: [...],
 *     roadmap: {...},
 *     competitivePositioning: {...},
 *     financialImpact: {...},
 *     specificRecommendations: [...],
 *     archetype: {...},
 *     keyInsight: "..."
 *   }
 * }
 */

const { getAssessment } = require('./db');
const { generateFullAnalysis } = require('./ai-integration');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Get assessment ID
    const { id } = req.query;

    // Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID required. Use ?id={uuid}'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assessment ID format'
      });
    }

    // Get assessment from database
    const assessment = await getAssessment(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // CHECK: Email must be provided to access full analysis
    if (!assessment.email) {
      return res.status(403).json({
        success: false,
        error: 'Email required to access full analysis',
        message: 'Please provide your email to unlock the comprehensive AI analysis'
      });
    }

    // Prepare data for AI
    const assessmentData = {
      companyName: assessment.company_name,
      companySize: assessment.company_size,
      monthlyTransactions: assessment.monthly_transactions,
      primaryMarket: assessment.primary_market,
      overallScore: assessment.overall_score,
      riskLevel: assessment.risk_level,
      categoryScores: assessment.scores,
      responses: assessment.responses
    };

    console.log(`[AI FULL] Generating comprehensive analysis for ${assessment.company_name}...`);

    // Generate full AI analysis
    const analysis = await generateFullAnalysis(assessmentData);

    // Success response
    res.status(200).json({
      success: true,
      analysis,
      cached: false // Could track this from ai-integration if needed
    });

  } catch (error) {
    console.error('Error in ai-full-analysis:', error);

    // Check if it's an AI-specific error
    if (error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        error: 'AI service configuration error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (error.message.includes('invalid JSON')) {
      return res.status(500).json({
        success: false,
        error: 'AI generation error - please try again',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate full analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
