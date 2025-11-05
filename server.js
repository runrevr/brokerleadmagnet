/**
 * Local Development Server
 * Simple Express server to test API endpoints locally
 *
 * Usage: node server.js
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
app.use(express.static('.'));

// Import API handlers
const assessmentSubmit = require('./api/assessment-submit');
const reportGet = require('./api/report-get');
const emailCapture = require('./api/email-capture');

// Wrap Vercel handlers for Express
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

// API Routes
app.post('/api/assessment-submit', wrapHandler(assessmentSubmit));
app.get('/api/report-get', wrapHandler(reportGet));
app.post('/api/email-capture', wrapHandler(emailCapture));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/assessment-submit`);
  console.log(`   GET  http://localhost:${PORT}/api/report-get?id={uuid}`);
  console.log(`   POST http://localhost:${PORT}/api/email-capture`);
  console.log(`\n🌐 Frontend:`);
  console.log(`   http://localhost:${PORT}/`);
  console.log(`\n✅ Ready for testing!\n`);
});
