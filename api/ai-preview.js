/**
 * GET /api/ai-preview?id={uuid}
 *
 * Generate AI-powered executive summary for assessment
 * This is TIER 1 - shown immediately without email capture
 *
 * Returns AI-generated insights to demonstrate value before asking for email
 *
 * Query params:
 * - id: Assessment UUID
 *
 * Response:
 * {
 *   success: true,
 *   summary: "AI-generated executive summary text..."
 * }
 */

const { getAssessment } = require('./db');
const { generateExecutiveSummary } = require('./ai-integration');

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

    console.log(`[AI PREVIEW] Generating summary for ${assessment.company_name}...`);

    // Generate AI summary
    const summary = await generateExecutiveSummary(assessmentData);

    // Success response
    res.status(200).json({
      success: true,
      summary,
      cached: false // Could track this from ai-integration if needed
    });

  } catch (error) {
    console.error('Error in ai-preview:', error);

    // Check if it's an AI-specific error
    if (error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        error: 'AI service configuration error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate AI preview',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
