/**
 * Local Development Server
 * Run with: node server-local.js
 *
 * This serves the HTML files and API endpoints for local testing
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2).substring(0, 500));
  }
  next();
});

// Clear require cache to ensure latest code is loaded
delete require.cache[require.resolve('./api/assessment-submit')];
delete require.cache[require.resolve('./api/email-capture')];
delete require.cache[require.resolve('./api/report-get')];
delete require.cache[require.resolve('./api/db')];

// Import API handlers
const assessmentSubmitHandler = require('./api/assessment-submit');
const emailCaptureHandler = require('./api/email-capture');
const reportGetHandler = require('./api/report-get');

// API Routes
app.post('/api/assessment-submit', assessmentSubmitHandler);
app.post('/api/email-capture', emailCaptureHandler);
app.get('/api/report-get', reportGetHandler);

// Serve main HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'brokerage-intelligence-platform.html'));
});

app.get('/report.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'report.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Assessment: http://localhost:${PORT}`);
  console.log(`📈 Report: http://localhost:${PORT}/report.html`);
  console.log(`\n✅ API endpoints ready:`);
  console.log(`   POST /api/assessment-submit`);
  console.log(`   POST /api/email-capture`);
  console.log(`   GET  /api/report-get?id={uuid}`);
  console.log(`\n⚙️  Environment:`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✓' : '✗'}`);
  console.log(`   ActiveCampaign: ${process.env.AC_API_URL ? '✓' : '✗'}\n`);
});
