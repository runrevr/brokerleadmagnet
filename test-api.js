/**
 * API Endpoints Test Script
 * Tests all three API endpoints locally
 *
 * Usage: node test-api.js
 *
 * Note: This test requires the API to be running locally
 * Start with: npm run dev
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Sample assessment data for testing
const sampleAssessmentData = {
  companyName: 'Test Realty Group',
  companySize: '26-50',
  monthlyTransactions: '20-30',
  primaryMarket: 'Austin, TX',
  overallScore: 68.5,
  riskLevel: 'HIGH',
  percentile: 45,
  categoryScores: [
    {
      category: 'Transaction Oversight',
      score: 18,
      maxScore: 35,
      percentage: 51.43
    },
    {
      category: 'Knowledge Management',
      score: 22,
      maxScore: 35,
      percentage: 62.86
    },
    {
      category: 'Client Experience',
      score: 25,
      maxScore: 35,
      percentage: 71.43
    },
    {
      category: 'Risk Management',
      score: 21,
      maxScore: 35,
      percentage: 60.00
    }
  ],
  responses: [
    {
      questionId: 'q1',
      questionText: 'How many contract reviews can you complete per week?',
      answer: '5-10 reviews',
      pointsEarned: 6
    },
    {
      questionId: 'q2',
      questionText: 'How long after receiving a contract do you typically complete compliance review?',
      answer: 'Within 24-48 hours',
      pointsEarned: 6
    }
  ],
  criticalGaps: [
    {
      category: 'Transaction Oversight',
      issue: 'Limited review capacity',
      severity: 'HIGH',
      impact: 'Delays in compliance reviews can lead to missed deadlines'
    },
    {
      category: 'Risk Management',
      issue: 'Manual deadline tracking',
      severity: 'MODERATE',
      impact: 'Increased risk of missing critical transaction milestones'
    }
  ]
};

async function testAPIs() {
  log('\n🧪 Testing API Endpoints...\n', 'blue');
  log('Note: Make sure you have started the dev server with: npm run dev\n', 'yellow');

  const API_BASE = process.env.FRONTEND_URL || 'http://localhost:3000';
  let assessmentId = null;

  try {
    // TEST 1: POST /api/assessment-submit
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('TEST 1: POST /api/assessment-submit', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

    log('Sending assessment data...', 'yellow');

    const submitResponse = await fetch(`${API_BASE}/api/assessment-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleAssessmentData)
    });

    const submitData = await submitResponse.json();

    if (submitResponse.ok && submitData.success) {
      log(`✅ Assessment submitted successfully!`, 'green');
      log(`   Assessment ID: ${submitData.assessmentId}`, 'green');
      assessmentId = submitData.assessmentId;
    } else {
      log(`❌ Assessment submission failed: ${submitData.error}`, 'red');
      return false;
    }

    // Wait a moment for database write
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TEST 2: GET /api/report-get
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('TEST 2: GET /api/report-get', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

    log(`Retrieving assessment ${assessmentId}...`, 'yellow');

    const getResponse = await fetch(`${API_BASE}/api/report-get?id=${assessmentId}`);
    const getData = await getResponse.json();

    if (getResponse.ok && getData.success) {
      log(`✅ Assessment retrieved successfully!`, 'green');
      log(`   Company: ${getData.data.company_name}`, 'green');
      log(`   Score: ${getData.data.overall_score}`, 'green');
      log(`   Risk Level: ${getData.data.risk_level}`, 'green');
      log(`   Category Scores: ${getData.data.scores?.length || 0}`, 'green');
      log(`   Responses: ${getData.data.responses?.length || 0}`, 'green');
      log(`   Gaps: ${getData.data.gaps?.length || 0}`, 'green');
    } else {
      log(`❌ Assessment retrieval failed: ${getData.error}`, 'red');
      return false;
    }

    // TEST 3: POST /api/email-capture
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('TEST 3: POST /api/email-capture', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

    const testEmail = 'test@example.com';
    log(`Capturing email: ${testEmail}...`, 'yellow');

    const emailResponse = await fetch(`${API_BASE}/api/email-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        assessmentId: assessmentId,
        reportData: {
          companyName: sampleAssessmentData.companyName,
          companySize: sampleAssessmentData.companySize,
          overallScore: sampleAssessmentData.overallScore,
          riskLevel: sampleAssessmentData.riskLevel,
          primaryMarket: sampleAssessmentData.primaryMarket
        }
      })
    });

    const emailData = await emailResponse.json();

    if (emailResponse.ok && emailData.success) {
      log(`✅ Email captured successfully!`, 'green');
      log(`   Report URL: ${emailData.reportUrl}`, 'green');

      if (process.env.AC_API_KEY) {
        log(`   ActiveCampaign: Contact should be created/updated`, 'green');
      } else {
        log(`   ⚠️  ActiveCampaign not configured (email saved to DB only)`, 'yellow');
      }
    } else {
      log(`❌ Email capture failed: ${emailData.error}`, 'red');
      return false;
    }

    // TEST 4: Verify email was saved
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('TEST 4: Verify email was saved', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

    const verifyResponse = await fetch(`${API_BASE}/api/report-get?id=${assessmentId}`);
    const verifyData = await verifyResponse.json();

    if (verifyData.success && verifyData.data.email === testEmail) {
      log(`✅ Email verified in database: ${verifyData.data.email}`, 'green');
      log(`   Completed at: ${verifyData.data.completed_at}`, 'green');
    } else {
      log(`❌ Email not found in database`, 'red');
      return false;
    }

    // TEST 5: Error handling tests
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('TEST 5: Error Handling', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

    // Test invalid UUID
    log('Testing invalid UUID...', 'yellow');
    const invalidResponse = await fetch(`${API_BASE}/api/report-get?id=invalid-uuid`);
    const invalidData = await invalidResponse.json();

    if (!invalidData.success) {
      log(`✅ Invalid UUID properly rejected: ${invalidData.error}`, 'green');
    } else {
      log(`❌ Invalid UUID should have been rejected`, 'red');
    }

    // Test missing email
    log('Testing missing email...', 'yellow');
    const missingEmailResponse = await fetch(`${API_BASE}/api/email-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId: assessmentId })
    });
    const missingEmailData = await missingEmailResponse.json();

    if (!missingEmailData.success) {
      log(`✅ Missing email properly rejected: ${missingEmailData.error}`, 'green');
    } else {
      log(`❌ Missing email should have been rejected`, 'red');
    }

    return true;

  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');

    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      log('\n⚠️  Is the dev server running?', 'yellow');
      log('   Start it with: npm run dev', 'yellow');
    }

    return false;
  }
}

// Run tests
testAPIs()
  .then(success => {
    if (success) {
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
      log('✅ ALL TESTS PASSED!', 'green');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
      log('\nYour API endpoints are working correctly!', 'green');
      log('Next steps:', 'blue');
      log('1. Configure ActiveCampaign API keys in .env', 'yellow');
      log('2. Test with real frontend integration', 'yellow');
      log('3. Deploy to production (npm run deploy)\n', 'yellow');
      process.exit(0);
    } else {
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
      log('❌ TESTS FAILED', 'red');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
      log('\nPlease fix the errors above and try again.\n', 'yellow');
      process.exit(1);
    }
  })
  .catch(err => {
    log(`\n❌ Fatal error: ${err.message}`, 'red');
    process.exit(1);
  });
