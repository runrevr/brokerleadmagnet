/**
 * POST /api/email-capture
 *
 * Capture user email and trigger marketing automation
 * Called when user submits their email to unlock full report
 *
 * Request body:
 * {
 *   email: string,
 *   assessmentId: string (uuid),
 *   reportData: {
 *     companyName: string,
 *     companySize: string,
 *     overallScore: number,
 *     riskLevel: string,
 *     primaryMarket: string
 *   }
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: "Email captured successfully"
 * }
 */

const { updateAssessmentEmail } = require('./db');
const {
  createOrUpdateContact,
  tagContact,
  updateCustomFields,
  isConfigured
} = require('./activecampaign');

module.exports = async (req, res) => {
  // Enable CORS
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
    const { email, assessmentId, reportData } = req.body;

    // Validation
    if (!email || !assessmentId) {
      return res.status(400).json({
        success: false,
        error: 'Email and assessment ID are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(assessmentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assessment ID format'
      });
    }

    // Step 1: Update assessment with email in database
    const assessment = await updateAssessmentEmail(assessmentId, email);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Step 2: ActiveCampaign integration (if configured)
    if (isConfigured()) {
      try {
        // Extract first name from company name (fallback)
        const firstName = reportData?.companyName?.split(' ')[0] || 'User';

        // Create/update contact in ActiveCampaign
        const contact = await createOrUpdateContact({
          email,
          firstName,
          fieldValues: []
        });

        console.log(`✅ Contact created/updated in ActiveCampaign: ${contact.id}`);

        // Add tags based on risk level
        if (reportData?.riskLevel) {
          await tagContact(contact.id, reportData.riskLevel);
          console.log(`✅ Tags applied for risk level: ${reportData.riskLevel}`);
        }

        // Build report URL
        const reportUrl = `${process.env.FRONTEND_URL || 'https://brokerleadmagnet.vercel.app'}/report?id=${assessmentId}`;

        // Update custom fields (matching your ActiveCampaign field names)
        if (reportData) {
          await updateCustomFields(contact.id, {
            'Brokerage name': reportData.companyName || '',
            'Brokerage size': reportData.companySize || '',
            'Overall Score': reportData.overallScore || 0,
            'Risk Level': reportData.riskLevel || '',
            'City': reportData.primaryMarket || '',
            'Assessment ID': assessmentId,
            'Monthly Transactions': reportData.monthlyTransactions || '',
            'Report URL': reportUrl
          });
          console.log('✅ Custom fields updated (including Report URL)');
        }

        // Note: Email automation should be triggered by tags in ActiveCampaign
        // Set up automation to trigger when "Lead Magnet" tag is added

      } catch (acError) {
        console.error('ActiveCampaign error (non-blocking):', acError);
        // Don't fail the request if ActiveCampaign fails
        // The email is still captured in the database
      }
    } else {
      console.warn('⚠️  ActiveCampaign not configured. Email saved to database only.');
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Email captured successfully',
      reportUrl: `${process.env.FRONTEND_URL || ''}/report?id=${assessmentId}`
    });

  } catch (error) {
    console.error('Error in email-capture:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to capture email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
