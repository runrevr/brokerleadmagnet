/**
 * GET /api/report-get?id={uuid}
 *
 * Retrieve a complete assessment by ID
 * Used for shareable report URLs and report retrieval
 *
 * Query params:
 * - id: Assessment UUID
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: "uuid",
 *     company_name: "...",
 *     overall_score: 75.5,
 *     risk_level: "MODERATE",
 *     scores: [...],
 *     responses: [...],
 *     gaps: [...]
 *   }
 * }
 */

const { getAssessment } = require('./db');

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
    // Get assessment ID from query params
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

    // Retrieve from database
    const assessment = await getAssessment(id);

    // Check if found
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('Error in report-get:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
