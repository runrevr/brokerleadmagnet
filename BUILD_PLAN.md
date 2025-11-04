# Brokerage Intelligence Platform - Build Plan

## Project Overview

### Current State
The Brokerage Intelligence Assessment Platform is **~90% complete**. The frontend is production-ready with:
- ✅ Complete 5-step assessment form (19 questions)
- ✅ Sophisticated scoring algorithm (140-point system)
- ✅ Beautiful UI with Tailwind CSS
- ✅ Data visualization (Chart.js - gauge & radar charts)
- ✅ Email capture gate
- ✅ Post-email premium content
- ✅ Mobile responsive design
- ✅ Print/PDF functionality

### What's Missing (Critical 10%)
- ❌ Backend API endpoints
- ❌ Database persistence (Supabase)
- ❌ Email automation (ActiveCampaign)
- ❌ Report retrieval system
- ❌ Analytics tracking
- ❌ Deployment infrastructure

---

## Phase 1: Project Setup & Architecture

### 1.1 Initialize Backend Structure
**Goal:** Set up project foundation

**Tasks:**
- [ ] Create `/api` folder for serverless functions
- [ ] Initialize `package.json`
- [ ] Create `.env.example` file with required variables
- [ ] Add `.gitignore` (node_modules, .env, etc.)
- [ ] Choose framework: **Recommended: Vercel Serverless Functions** (simplest deployment)

**File Structure:**
```
leadmagnet/
├── brokerage-intelligence-platform.html  (existing)
├── BUILD_PLAN.md                         (this file)
├── package.json                          (new)
├── .env                                  (new - gitignored)
├── .env.example                          (new)
├── .gitignore                            (new)
└── api/                                  (new)
    ├── assessment-submit.js
    ├── report-get.js
    └── email-capture.js
```

### 1.2 Install Dependencies
```bash
npm init -y
npm install @supabase/supabase-js dotenv node-fetch
npm install -D @vercel/node
```

**Optional (for PDF generation):**
```bash
npm install puppeteer jspdf html2canvas
```

### 1.3 Environment Variables
Create `.env` file:
```env
# Supabase
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ActiveCampaign
AC_API_URL=https://youraccountname.api-us1.com
AC_API_KEY=your-api-key

# Optional
FRONTEND_URL=https://yourdomain.com
```

---

## Phase 2: Database Implementation (Supabase)

### 2.1 Create Supabase Project
**Goal:** Set up hosted PostgreSQL database

**Tasks:**
- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Copy URL and anon key to `.env`
- [ ] Navigate to SQL Editor in dashboard

### 2.2 Execute Database Schema
**Goal:** Create 4 tables from HTML comments (lines 695-864)

**Run this SQL in Supabase SQL Editor:**
```sql
-- Assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  monthly_transactions TEXT NOT NULL,
  primary_market TEXT NOT NULL,
  overall_score DECIMAL(5,2) NOT NULL,
  risk_level TEXT NOT NULL,
  percentile INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Scores by category
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL
);

-- Individual question responses
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  points_earned INTEGER NOT NULL
);

-- Identified gaps/weaknesses
CREATE TABLE gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  issue TEXT NOT NULL,
  severity TEXT NOT NULL,
  impact TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_assessments_email ON assessments(email);
CREATE INDEX idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX idx_scores_assessment ON scores(assessment_id);
CREATE INDEX idx_responses_assessment ON responses(assessment_id);
CREATE INDEX idx_gaps_assessment ON gaps(assessment_id);
```

### 2.3 Set Up Row Level Security (RLS)
**Goal:** Secure database access

```sql
-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaps ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for API)
CREATE POLICY "Service role can do everything" ON assessments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON scores
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON responses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON gaps
  FOR ALL USING (auth.role() = 'service_role');
```

### 2.4 Create Database Helper Module
**File:** `api/db.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function saveAssessment(data) {
  // Insert assessment
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .insert([{
      company_name: data.companyName,
      company_size: data.companySize,
      monthly_transactions: data.monthlyTransactions,
      primary_market: data.primaryMarket,
      overall_score: data.overallScore,
      risk_level: data.riskLevel,
      percentile: data.percentile
    }])
    .select()
    .single();

  if (assessmentError) throw assessmentError;

  // Insert scores
  const scoresData = data.categoryScores.map(score => ({
    assessment_id: assessment.id,
    category: score.category,
    score: score.score,
    max_score: score.maxScore,
    percentage: score.percentage
  }));

  await supabase.from('scores').insert(scoresData);

  // Insert responses
  const responsesData = data.responses.map(resp => ({
    assessment_id: assessment.id,
    question_id: resp.questionId,
    question_text: resp.questionText,
    answer: resp.answer,
    points_earned: resp.pointsEarned
  }));

  await supabase.from('responses').insert(responsesData);

  // Insert gaps
  const gapsData = data.criticalGaps.map(gap => ({
    assessment_id: assessment.id,
    category: gap.category,
    issue: gap.issue,
    severity: gap.severity,
    impact: gap.impact
  }));

  await supabase.from('gaps').insert(gapsData);

  return assessment.id;
}

async function getAssessment(id) {
  const { data: assessment } = await supabase
    .from('assessments')
    .select(`
      *,
      scores(*),
      responses(*),
      gaps(*)
    `)
    .eq('id', id)
    .single();

  return assessment;
}

async function updateAssessmentEmail(id, email) {
  const { data, error } = await supabase
    .from('assessments')
    .update({
      email,
      completed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { saveAssessment, getAssessment, updateAssessmentEmail };
```

### 2.5 Test Database Connection
**Tasks:**
- [ ] Create simple test script
- [ ] Verify insert operations work
- [ ] Verify select operations work
- [ ] Check Supabase dashboard shows data

---

## Phase 3: API Development

### 3.1 POST /api/assessment-submit
**Purpose:** Save assessment results to database

**File:** `api/assessment-submit.js`

```javascript
const { saveAssessment } = require('./db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const assessmentData = req.body;

    // Validation
    if (!assessmentData.companyName || !assessmentData.overallScore) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to database
    const assessmentId = await saveAssessment(assessmentData);

    res.status(200).json({
      success: true,
      assessmentId,
      message: 'Assessment saved successfully'
    });

  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
};
```

### 3.2 GET /api/report-get
**Purpose:** Retrieve assessment by ID

**File:** `api/report-get.js`

```javascript
const { getAssessment } = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Assessment ID required' });
  }

  try {
    const assessment = await getAssessment(id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('Error retrieving assessment:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment' });
  }
};
```

### 3.3 POST /api/email-capture
**Purpose:** Capture email and trigger ActiveCampaign

**File:** `api/email-capture.js`

```javascript
const { updateAssessmentEmail } = require('./db');
const { createOrUpdateContact, tagContact, sendReport } = require('./activecampaign');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email, assessmentId, reportData } = req.body;

    // Validation
    if (!email || !assessmentId) {
      return res.status(400).json({ error: 'Email and assessment ID required' });
    }

    // Update assessment with email
    const assessment = await updateAssessmentEmail(assessmentId, email);

    // Create/update contact in ActiveCampaign
    const contact = await createOrUpdateContact({
      email,
      firstName: reportData.companyName.split(' ')[0], // Extract from company name
      fields: {
        company_name: reportData.companyName,
        company_size: reportData.companySize,
        overall_score: reportData.overallScore,
        risk_level: reportData.riskLevel,
        primary_market: reportData.primaryMarket
      }
    });

    // Add tags based on risk level
    await tagContact(contact.id, reportData.riskLevel);

    // Send full report via email (optional - or trigger automation)
    // await sendReport(email, assessmentId, reportData);

    res.status(200).json({
      success: true,
      message: 'Email captured successfully'
    });

  } catch (error) {
    console.error('Error capturing email:', error);
    res.status(500).json({ error: 'Failed to capture email' });
  }
};
```

---

## Phase 4: ActiveCampaign Integration

### 4.1 Set Up ActiveCampaign Account
**Tasks:**
- [ ] Create account at [activecampaign.com](https://www.activecampaign.com)
- [ ] Navigate to Settings → Developer → API Access
- [ ] Copy API URL and Key to `.env`
- [ ] Create custom fields: `company_name`, `company_size`, `overall_score`, `risk_level`, `primary_market`

### 4.2 Create ActiveCampaign Helper Module
**File:** `api/activecampaign.js`

```javascript
const fetch = require('node-fetch');

const AC_API_URL = process.env.AC_API_URL;
const AC_API_KEY = process.env.AC_API_KEY;

async function createOrUpdateContact(contactData) {
  const response = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
    method: 'POST',
    headers: {
      'Api-Token': AC_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contact: {
        email: contactData.email,
        firstName: contactData.firstName,
        fieldValues: Object.entries(contactData.fields || {}).map(([key, value]) => ({
          field: key,
          value: String(value)
        }))
      }
    })
  });

  const data = await response.json();
  return data.contact;
}

async function tagContact(contactId, riskLevel) {
  // Map risk levels to tags
  const tagMap = {
    'CRITICAL': ['Lead Magnet', 'Critical Risk', 'High Priority'],
    'HIGH': ['Lead Magnet', 'High Risk', 'Medium Priority'],
    'MODERATE': ['Lead Magnet', 'Moderate Risk', 'Low Priority'],
    'LOW': ['Lead Magnet', 'Low Risk', 'Nurture']
  };

  const tags = tagMap[riskLevel] || ['Lead Magnet'];

  for (const tag of tags) {
    await fetch(`${AC_API_URL}/api/3/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': AC_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: tag
        }
      })
    });
  }
}

async function addToAutomation(contactId, automationId) {
  const response = await fetch(`${AC_API_URL}/api/3/contactAutomations`, {
    method: 'POST',
    headers: {
      'Api-Token': AC_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contactAutomation: {
        contact: contactId,
        automation: automationId
      }
    })
  });

  return await response.json();
}

module.exports = {
  createOrUpdateContact,
  tagContact,
  addToAutomation
};
```

### 4.3 Create Email Automation Sequences in ActiveCampaign

#### Automation 1: Report Delivery (Immediate)
**Trigger:** Contact tagged with "Lead Magnet"

**Email Template:**
- **Subject:** Your Brokerage Intelligence Report is Ready
- **Content:**
  - Personalized greeting with company name
  - Overall score and risk level
  - Link to full report: `https://yourdomain.com/report?id={assessmentId}`
  - Call-to-action: "View Your Full Report"

#### Automation 2: Educational Drip Campaign
- **Day 0:** Full report delivery (above)
- **Day 2:** "How Top 5% Brokerages Handle [Their Weakest Category]"
- **Day 4:** Case study matching their risk level
- **Day 7:** "Book Your Strategy Call" (demo offer)
- **Day 14:** Final nurture or mark as cold

### 4.4 Custom Field Mapping
Create these custom fields in ActiveCampaign:

| Field Name | Type | Purpose |
|------------|------|---------|
| `company_name` | Text | Brokerage name |
| `company_size` | Text | Number of agents |
| `overall_score` | Number | 0-100 score |
| `risk_level` | Text | CRITICAL/HIGH/MODERATE/LOW |
| `primary_market` | Text | City/market |
| `assessment_id` | Text | UUID for report retrieval |
| `monthly_transactions` | Text | Transaction volume |

---

## Phase 5: Report Generation & Delivery

### 5.1 PDF Generation Options

#### Option A: Puppeteer (Server-side rendering)
**Pros:** High fidelity, uses existing HTML
**Cons:** Heavy dependency, slower

```javascript
const puppeteer = require('puppeteer');

async function generatePDF(assessmentId) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`${process.env.FRONTEND_URL}/report?id=${assessmentId}`, {
    waitUntil: 'networkidle0'
  });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  });

  await browser.close();
  return pdf;
}
```

#### Option B: Use Browser's Built-in Print
**Pros:** Simple, already implemented in HTML
**Cons:** Requires user action

**Recommended:** Start with Option B (already working), add Option A later if automated delivery needed.

### 5.2 File Storage Setup

#### Using Supabase Storage
**Tasks:**
- [ ] Create bucket named `reports` in Supabase Storage
- [ ] Set bucket to public (or signed URLs)
- [ ] Upload PDFs with assessment ID as filename

```javascript
async function uploadReportPDF(assessmentId, pdfBuffer) {
  const { data, error } = await supabase.storage
    .from('reports')
    .upload(`${assessmentId}.pdf`, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('reports')
    .getPublicUrl(`${assessmentId}.pdf`);

  return urlData.publicUrl;
}
```

### 5.3 Email Report Delivery
**Add to `api/activecampaign.js`:**

```javascript
async function sendReportEmail(email, assessmentId, reportUrl) {
  // Use ActiveCampaign's transactional email or automation
  // Triggered when contact is tagged "Lead Magnet"
  // Include {reportUrl} in email template
}
```

---

## Phase 6: Frontend Integration

### 6.1 Update HTML File API Calls
**Location:** [brokerage-intelligence-platform.html:247-257](brokerage-intelligence-platform.html#L247-L257)

**Replace TODO comments with actual API calls:**

```javascript
// Line 247 - After calculating results
const submitAssessment = async () => {
  try {
    const response = await fetch('https://yourdomain.com/api/assessment-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: formData.companyName,
        companySize: formData.companySize,
        monthlyTransactions: formData.monthlyTransactions,
        primaryMarket: formData.primaryMarket,
        overallScore: results.overallScore,
        riskLevel: results.riskLevel,
        percentile: results.percentile,
        categoryScores: results.categoryScores,
        responses: results.responses,
        criticalGaps: results.criticalGaps
      })
    });

    const data = await response.json();

    if (data.success) {
      setAssessmentId(data.assessmentId);
      // Store in localStorage for retrieval
      localStorage.setItem('assessmentId', data.assessmentId);
    }
  } catch (error) {
    console.error('Failed to save assessment:', error);
    // Still show results even if save fails
  }
};
```

### 6.2 Email Capture Handler
**Location:** [brokerage-intelligence-platform.html:257](brokerage-intelligence-platform.html#L257)

```javascript
const handleEmailSubmit = async () => {
  if (!email || !assessmentId) return;

  try {
    const response = await fetch('https://yourdomain.com/api/email-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        assessmentId,
        reportData: {
          companyName: formData.companyName,
          companySize: formData.companySize,
          overallScore: results.overallScore,
          riskLevel: results.riskLevel,
          primaryMarket: formData.primaryMarket
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      setEmailSubmitted(true);
      // Track conversion
      if (window.gtag) {
        gtag('event', 'lead_captured', {
          event_category: 'Lead Magnet',
          event_label: results.riskLevel,
          value: results.overallScore
        });
      }
    }
  } catch (error) {
    console.error('Failed to capture email:', error);
    alert('Something went wrong. Please try again.');
  }
};
```

### 6.3 Add Loading States
**Add to React components:**

```javascript
const [isSubmitting, setIsSubmitting] = React.useState(false);

// In submit handlers:
setIsSubmitting(true);
try {
  // ... API call
} finally {
  setIsSubmitting(false);
}

// In JSX:
<button disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Submit'}
</button>
```

### 6.4 Error Handling & User Feedback

```javascript
const [error, setError] = React.useState(null);

// Show error messages
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

---

## Phase 7: Testing & Quality Assurance

### 7.1 End-to-End Testing Checklist
- [ ] **Form Submission**
  - [ ] Complete all 5 steps
  - [ ] Verify required field validation works
  - [ ] Check progress bar updates correctly
  - [ ] Confirm navigation (Previous/Next) works

- [ ] **Results Display**
  - [ ] Overall score calculates correctly
  - [ ] Risk level badge shows proper color
  - [ ] Charts render (gauge + radar)
  - [ ] Category breakdowns display
  - [ ] Critical gaps identified (max 3)

- [ ] **Database Persistence**
  - [ ] Assessment saved to `assessments` table
  - [ ] Scores saved to `scores` table
  - [ ] Responses saved to `responses` table
  - [ ] Gaps saved to `gaps` table
  - [ ] Check Supabase dashboard

- [ ] **Email Capture**
  - [ ] Email validation works
  - [ ] Assessment updated with email
  - [ ] Contact created in ActiveCampaign
  - [ ] Correct tags applied
  - [ ] Custom fields populated

- [ ] **Email Automation**
  - [ ] Report delivery email sent immediately
  - [ ] Personalization works (company name, score)
  - [ ] Report URL accessible
  - [ ] Drip sequence triggered

- [ ] **Report Retrieval**
  - [ ] Access report via URL: `/report?id={uuid}`
  - [ ] Report displays all data correctly
  - [ ] Print functionality works

### 7.2 Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 7.3 Mobile Responsiveness
- [ ] Test on 375px (iPhone SE)
- [ ] Test on 768px (tablet)
- [ ] Test on 1024px (desktop)
- [ ] Touch targets minimum 44px
- [ ] Text readable without zoom

### 7.4 Performance Testing
- [ ] Lighthouse score > 90
- [ ] API response time < 2 seconds
- [ ] Page load time < 3 seconds
- [ ] Chart rendering smooth
- [ ] No console errors

### 7.5 Security Audit
- [ ] **Input Validation**
  - [ ] Sanitize all user inputs
  - [ ] Validate email format
  - [ ] Check for XSS vulnerabilities
  - [ ] Prevent SQL injection (Supabase RLS helps)

- [ ] **Rate Limiting**
  - [ ] Limit assessment submissions (prevent spam)
  - [ ] Limit email captures per IP
  - [ ] Add CAPTCHA if needed

- [ ] **Environment Variables**
  - [ ] No API keys in frontend code
  - [ ] `.env` file gitignored
  - [ ] Service role key never exposed

- [ ] **CORS Configuration**
  - [ ] Only allow your domain
  - [ ] No wildcard `*` in production

---

## Phase 8: Deployment

### 8.1 Deploy Backend to Vercel

**Tasks:**
- [ ] Create Vercel account
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Create `vercel.json` config

**File:** `vercel.json`
```json
{
  "version": 2,
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "AC_API_URL": "@activecampaign-url",
    "AC_API_KEY": "@activecampaign-key"
  },
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

**Deploy:**
```bash
vercel --prod
```

**Add Environment Variables in Vercel Dashboard:**
- Settings → Environment Variables
- Add all variables from `.env`

### 8.2 Deploy Frontend

#### Option A: Same Vercel Project
- [ ] Move HTML file to `public/index.html`
- [ ] Add to `vercel.json`:
```json
{
  "routes": [
    { "src": "/", "dest": "/public/index.html" },
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
```

#### Option B: Separate Hosting (Netlify/Cloudflare Pages)
- [ ] Upload HTML file to hosting provider
- [ ] Configure custom domain
- [ ] Update API URLs in HTML to point to Vercel backend

### 8.3 Custom Domain Setup
**Tasks:**
- [ ] Purchase domain (e.g., `brokerage-intelligence.com`)
- [ ] Add domain to Vercel/Netlify
- [ ] Configure DNS records:
  - A record: `@` → Vercel IP
  - CNAME: `www` → `your-project.vercel.app`
- [ ] SSL certificate (auto-provisioned by Vercel)
- [ ] Test HTTPS access

### 8.4 Update CORS & URLs
**In all API files, replace:**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

**With:**
```javascript
const allowedOrigins = ['https://yourdomain.com', 'https://www.yourdomain.com'];
const origin = req.headers.origin;

if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

**In HTML file, update:**
```javascript
// Replace 'https://yourdomain.com' with actual domain
const API_BASE = 'https://yourdomain.com/api';
```

---

## Phase 9: Analytics & Monitoring

### 9.1 Google Analytics Setup
**Tasks:**
- [ ] Create GA4 property
- [ ] Add tracking code to HTML `<head>`

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 9.2 Conversion Tracking Events

**Track key actions:**

```javascript
// Step completion
gtag('event', 'step_completed', {
  event_category: 'Assessment',
  event_label: `Step ${currentStep}`,
  value: currentStep
});

// Assessment completion
gtag('event', 'assessment_completed', {
  event_category: 'Assessment',
  event_label: results.riskLevel,
  value: results.overallScore
});

// Email captured (CONVERSION!)
gtag('event', 'conversion', {
  send_to: 'AW-XXXXXXXXXX/XXXXXX', // Google Ads conversion if using
  event_category: 'Lead',
  event_label: 'Email Captured',
  value: 1
});

// Report downloaded/printed
gtag('event', 'report_action', {
  event_category: 'Engagement',
  event_label: 'Print/Download'
});
```

### 9.3 Error Monitoring (Sentry)

**Optional but recommended:**

```bash
npm install @sentry/node
```

**In API files:**
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development'
});

// In catch blocks:
catch (error) {
  Sentry.captureException(error);
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}
```

### 9.4 Admin Dashboard (Optional)

**Quick Admin View in Supabase:**
- Use Supabase's built-in table editor
- Create views for:
  - Recent submissions
  - Conversion rate (emails captured / total assessments)
  - Average scores by risk level
  - Top markets

**Custom Dashboard (Advanced):**
- Build Next.js admin app
- Protected routes with authentication
- Display:
  - Daily/weekly/monthly submissions
  - Email capture rate
  - ActiveCampaign sync status
  - Recent leads with scores

### 9.5 Key Metrics to Track

| Metric | Formula | Goal |
|--------|---------|------|
| **Completion Rate** | Completed / Started | > 60% |
| **Email Capture Rate** | Emails / Completed | > 80% |
| **Overall Conversion** | Emails / Started | > 48% |
| **Avg Time on Assessment** | Analytics | 5-8 min |
| **Mobile Completion Rate** | Mobile Completed / Started | > 50% |
| **Bounce Rate** | Analytics | < 30% |

---

## Phase 10: Optimization & Iteration (Post-Launch)

### 10.1 A/B Testing Ideas
- [ ] **Email Gate Position**
  - Test: Gate before vs. after showing results
  - Hypothesis: After results = higher trust = more emails

- [ ] **CTA Copy**
  - Test: "Get Your Full Report" vs. "Download Free Report"
  - Track: Click-through rate

- [ ] **Question Length**
  - Test: 19 questions vs. 12 questions
  - Track: Completion rate

- [ ] **Value Proposition**
  - Test different headlines/subheadings
  - Track: Start rate

### 10.2 Content Enhancements
- [ ] Add video explanation of scoring methodology
- [ ] Include industry benchmarks in results
- [ ] Add testimonials from brokerages
- [ ] Create shareable social media cards
- [ ] Add "Compare to Industry Average" feature

### 10.3 Lead Nurturing Improvements
- [ ] Segment emails by risk level (already tagged)
- [ ] Create risk-specific content offers
- [ ] Add SMS option for high-priority leads
- [ ] Implement lead scoring in CRM
- [ ] Set up sales team notifications for CRITICAL risk

### 10.4 Technical Improvements
- [ ] Add progressive web app (PWA) capabilities
- [ ] Implement offline support (save progress)
- [ ] Add "Save & Resume Later" feature
- [ ] Create embeddable widget version
- [ ] Build WordPress plugin

---

## Success Criteria

### Launch Readiness Checklist
- [ ] All 3 API endpoints working
- [ ] Database saving data correctly
- [ ] ActiveCampaign contact creation confirmed
- [ ] Email automation sending reports
- [ ] Frontend calling live APIs (not console.log)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Passes security audit
- [ ] Analytics tracking
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error monitoring set up

### Week 1 Goals (Post-Launch)
- [ ] 50+ assessment completions
- [ ] > 70% email capture rate
- [ ] < 5 technical errors
- [ ] ActiveCampaign automation working smoothly
- [ ] First demo booking from lead

### Month 1 Goals
- [ ] 500+ assessments
- [ ] 400+ emails captured
- [ ] 10+ qualified sales conversations
- [ ] 1+ customer acquisition
- [ ] Positive ROI on traffic spend

---

## Resource Links

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [ActiveCampaign API](https://developers.activecampaign.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Supabase Dashboard](https://app.supabase.com)
- [ActiveCampaign Dashboard](https://www.activecampaign.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Analytics](https://analytics.google.com)

### Testing Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [BrowserStack](https://www.browserstack.com) (cross-browser testing)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WAVE Accessibility](https://wave.webaim.org/)

---

## Timeline Estimate

| Phase | Time Estimate | Priority |
|-------|---------------|----------|
| Phase 1: Setup | 1-2 hours | CRITICAL |
| Phase 2: Database | 2-3 hours | CRITICAL |
| Phase 3: API Development | 4-6 hours | CRITICAL |
| Phase 4: ActiveCampaign | 3-4 hours | CRITICAL |
| Phase 5: Report Generation | 2-3 hours | HIGH |
| Phase 6: Frontend Integration | 2-3 hours | CRITICAL |
| Phase 7: Testing | 4-6 hours | CRITICAL |
| Phase 8: Deployment | 2-3 hours | CRITICAL |
| Phase 9: Analytics | 2-3 hours | HIGH |
| **TOTAL** | **22-33 hours** | **3-5 days** |

---

## Next Steps

1. **Start with Phase 1** - Get project structure set up
2. **Set up Supabase** - Critical dependency for everything else
3. **Build APIs sequentially** - Test each endpoint before moving on
4. **Integrate ActiveCampaign** - Can be done in parallel with APIs
5. **Update frontend** - Connect to live APIs
6. **Test thoroughly** - Don't skip this!
7. **Deploy** - Go live!
8. **Monitor & iterate** - Continuous improvement

---

## Questions or Blockers?

If you encounter issues during implementation:

1. **Database errors** - Check Supabase logs and RLS policies
2. **CORS errors** - Verify allowed origins match your domain
3. **ActiveCampaign not working** - Check API key permissions
4. **Deployment issues** - Review Vercel build logs
5. **Email not sending** - Verify automation triggers and contact creation

Document any deviations from this plan and update accordingly.

---

**Last Updated:** 2025-11-03
**Status:** Ready to Build
**Estimated Completion:** 3-5 business days
