/**
 * Complete API Test - Starts server and runs all tests
 * Usage: node test-apis-complete.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// API handlers
const assessmentSubmit = require('./api/assessment-submit');
const reportGet = require('./api/report-get');
const emailCapture = require('./api/email-capture');

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

// Sample data
const sampleData = {
  companyName: 'Test Realty Group',
  companySize: '26-50',
  monthlyTransactions: '20-30',
  primaryMarket: 'Austin, TX',
  overallScore: 68.5,
  riskLevel: 'HIGH',
  percentile: 45,
  categoryScores: [
    { category: 'Transaction Oversight', score: 18, maxScore: 35, percentage: 51.43 },
    { category: 'Knowledge Management', score: 22, maxScore: 35, percentage: 62.86 },
    { category: 'Client Experience', score: 25, maxScore: 35, percentage: 71.43 },
    { category: 'Risk Management', score: 21, maxScore: 35, percentage: 60.00 }
  ],
  responses: [
    { questionId: 'q1', questionText: 'Test question 1', answer: '5-10 reviews', pointsEarned: 6 },
    { questionId: 'q2', questionText: 'Test question 2', answer: 'Within 24-48 hours', pointsEarned: 6 }
  ],
  criticalGaps: [
    { category: 'Transaction Oversight', issue: 'Limited review capacity', severity: 'HIGH', impact: 'Delays in compliance' },
    { category: 'Risk Management', issue: 'Manual tracking', severity: 'MODERATE', impact: 'Missed deadlines' }
  ]
};

async function runTests() {
  log('\n🧪 Starting API Tests with Embedded Server\n', 'blue');

  // Create Express app
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Wrap handlers
  const wrap = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    }
  };

  app.post('/api/assessment-submit', wrap(assessmentSubmit));
  app.get('/api/report-get', wrap(reportGet));
  app.post('/api/email-capture', wrap(emailCapture));

  // Start server
  const server = app.listen(3001, async () => {
    log('✅ Test server started on port 3001\n', 'green');

    let assessmentId = null;

    try {
      // TEST 1
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
      log('TEST 1: POST /api/assessment-submit', 'yellow');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

      const submitRes = await fetch('http://localhost:3001/api/assessment-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleData)
      });

      const submitData = await submitRes.json();

      if (submitData.success) {
        log(`✅ Assessment submitted: ${submitData.assessmentId}`, 'green');
        assessmentId = submitData.assessmentId;
      } else {
        throw new Error(`Submit failed: ${submitData.error}`);
      }

      // Wait for DB
      await new Promise(r => setTimeout(r, 1000));

      // TEST 2
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
      log('TEST 2: GET /api/report-get', 'yellow');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

      const getRes = await fetch(`http://localhost:3001/api/report-get?id=${assessmentId}`);
      const getData = await getRes.json();

      if (getData.success) {
        log(`✅ Retrieved: ${getData.data.company_name}`, 'green');
        log(`   Score: ${getData.data.overall_score}`, 'green');
        log(`   Scores: ${getData.data.scores?.length}, Responses: ${getData.data.responses?.length}, Gaps: ${getData.data.gaps?.length}`, 'green');
      } else {
        throw new Error(`Get failed: ${getData.error}`);
      }

      // TEST 3
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
      log('TEST 3: POST /api/email-capture', 'yellow');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

      const emailRes = await fetch('http://localhost:3001/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          assessmentId,
          reportData: {
            companyName: sampleData.companyName,
            companySize: sampleData.companySize,
            overallScore: sampleData.overallScore,
            riskLevel: sampleData.riskLevel,
            primaryMarket: sampleData.primaryMarket,
            monthlyTransactions: sampleData.monthlyTransactions
          }
        })
      });

      const emailData = await emailRes.json();

      if (emailData.success) {
        log(`✅ Email captured successfully`, 'green');
        log(`   Report URL: ${emailData.reportUrl}`, 'green');
      } else {
        throw new Error(`Email capture failed: ${emailData.error}`);
      }

      // TEST 4
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
      log('TEST 4: Verify Email Saved', 'yellow');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

      const verifyRes = await fetch(`http://localhost:3001/api/report-get?id=${assessmentId}`);
      const verifyData = await verifyRes.json();

      if (verifyData.data.email === 'test@example.com') {
        log(`✅ Email verified in database: ${verifyData.data.email}`, 'green');
      } else {
        throw new Error('Email not saved');
      }

      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
      log('✅ ALL TESTS PASSED!', 'green');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
      log('\nPhase 3: API Development - COMPLETE!\n', 'blue');

      server.close();
      process.exit(0);

    } catch (error) {
      log(`\n❌ TEST FAILED: ${error.message}`, 'red');
      console.error(error);
      server.close();
      process.exit(1);
    }
  });
}

runTests();
