/**
 * GET /api/agents-report-get?id={shareableToken}
 *
 * Retrieve a saved agent assessment report by shareable token
 * Used by agents-report.html to display full reports
 *
 * Query parameters:
 * - id: shareable token (UUID)
 *
 * Response:
 * {
 *   success: true,
 *   report: {
 *     assessmentId: UUID,
 *     companyName: string,
 *     companySize: string,
 *     monthlyTransactions: string,
 *     primaryMarket: string,
 *     overallScore: number,
 *     riskLevel: string,
 *     percentileRank: string,
 *     executiveSummary: string (AI-generated),
 *     fullAnalysis: object (AI-generated JSON),
 *     categoryScores: array,
 *     responses: array,
 *     gaps: array,
 *     createdAt: ISO timestamp,
 *     expiresAt: ISO timestamp
 *   }
 * }
 *
 * Error responses:
 * - 400: Missing token
 * - 404: Report not found or expired
 * - 500: Server error
 */

const { supabase } = require('./db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Extract token from query parameters
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: id (shareable token)'
      });
    }

    console.log(`[AGENT-REPORT-GET] Fetching report for token: ${id.substring(0, 8)}...`);

    // Fetch assessment from database using shareable_token
    // Verify it's an agent assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('shareable_token', id)
      .eq('assessment_type', 'agent')
      .single();

    if (assessmentError || !assessment) {
      console.log('[AGENT-REPORT-GET] Report not found');
      return res.status(404).json({
        success: false,
        error: 'Report not found',
        message: 'This report link may be invalid or expired.'
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(assessment.token_expires_at);

    if (now > expiresAt) {
      console.log('[AGENT-REPORT-GET] Report expired');
      return res.status(404).json({
        success: false,
        error: 'Report expired',
        message: 'This report link has expired. Reports are available for 2 days after creation.'
      });
    }

    // Fetch related data
    const [scoresResult, responsesResult, gapsResult] = await Promise.all([
      supabase
        .from('scores')
        .select('*')
        .eq('assessment_id', assessment.id),
      supabase
        .from('responses')
        .select('*')
        .eq('assessment_id', assessment.id),
      supabase
        .from('gaps')
        .select('*')
        .eq('assessment_id', assessment.id)
    ]);

    const categoryScores = scoresResult.data || [];
    const responses = responsesResult.data || [];
    const gaps = gapsResult.data || [];

    // Construct full report object
    const report = {
      assessmentId: assessment.id,
      companyName: assessment.company_name,
      companySize: assessment.company_size,
      monthlyTransactions: assessment.monthly_transactions,
      primaryMarket: assessment.primary_market,
      overallScore: assessment.overall_score,
      riskLevel: assessment.risk_level,
      percentileRank: assessment.percentile_rank,
      executiveSummary: assessment.ai_executive_summary,
      fullAnalysis: assessment.ai_full_analysis,
      categoryScores: categoryScores.map(cs => ({
        category: cs.category,
        score: cs.score,
        maxScore: cs.max_score,
        percentage: cs.percentage
      })),
      responses: responses.map(r => ({
        questionId: r.question_id,
        questionText: r.question_text,
        answer: r.answer,
        pointsEarned: r.points_earned
      })),
      gaps: gaps.map(g => ({
        questionId: g.question_id,
        questionText: g.question_text,
        currentAnswer: g.current_answer,
        aiOptimizedAnswer: g.ai_optimized_answer,
        pointsLost: g.points_lost,
        severity: g.severity
      })),
      createdAt: assessment.created_at,
      expiresAt: assessment.token_expires_at,
      completedAt: assessment.completed_at,
      email: assessment.email
    };

    console.log(`[AGENT-REPORT-GET] Report found for ${assessment.company_name}`);

    // Success response
    res.status(200).json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error in agents-report-get:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
