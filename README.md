# Brokerage Intelligence Platform

A sophisticated lead magnet assessment tool for real estate brokerages. Evaluates operational maturity across 4 key dimensions and captures qualified leads.

## Project Structure

```
leadmagnet/
├── brokerage-intelligence-platform.html  # Frontend (React + Tailwind)
├── BUILD_PLAN.md                         # Complete implementation plan
├── package.json                          # Dependencies
├── vercel.json                           # Deployment configuration
├── .env.example                          # Environment variables template
└── api/                                  # Backend API endpoints
    ├── db.js                             # Database helper functions
    ├── assessment-submit.js              # Save assessment endpoint
    ├── report-get.js                     # Retrieve report endpoint
    └── email-capture.js                  # Email capture + automation
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- **SUPABASE_URL** - From Supabase project settings
- **SUPABASE_SERVICE_ROLE_KEY** - From Supabase project settings
- **AC_API_URL** - From ActiveCampaign API settings
- **AC_API_KEY** - From ActiveCampaign API settings

### 3. Set Up Database (Supabase)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run the SQL schema from `BUILD_PLAN.md` Phase 2
4. Copy credentials to `.env`

### 4. Configure ActiveCampaign

1. Create account at [activecampaign.com](https://www.activecampaign.com)
2. Get API credentials from Settings → Developer
3. Create custom fields (see `BUILD_PLAN.md` Phase 4)
4. Set up automation sequences

### 5. Local Development

```bash
npm run dev
```

Runs Vercel dev server on `http://localhost:3000`

### 6. Deploy to Production

```bash
npm run deploy
```

Or push to GitHub and connect to Vercel for automatic deployments.

## Features

- **Multi-step Assessment** - 19 questions across 5 categories
- **Intelligent Scoring** - 140-point system with risk level classification
- **Data Visualization** - Chart.js powered gauge and radar charts
- **Email Gate** - Strategic lead capture after showing value
- **CRM Integration** - Automatic contact creation in ActiveCampaign
- **Email Automation** - Triggered drip sequences based on risk level
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Report Persistence** - Full database storage with retrieval URLs

## Tech Stack

### Frontend
- React 18 (via CDN)
- Tailwind CSS
- Chart.js
- Vanilla JavaScript

### Backend
- Node.js (Vercel Serverless Functions)
- Supabase (PostgreSQL)
- ActiveCampaign API

### Deployment
- Vercel (recommended)
- Compatible with Netlify, Cloudflare Pages

## API Endpoints

### POST /api/assessment-submit
Save assessment results to database
- **Request:** Assessment data object
- **Response:** `{ success: true, assessmentId: "uuid" }`

### GET /api/report-get?id={uuid}
Retrieve assessment by ID
- **Request:** Assessment UUID in query params
- **Response:** `{ success: true, data: {...} }`

### POST /api/email-capture
Capture email and trigger automation
- **Request:** `{ email, assessmentId, reportData }`
- **Response:** `{ success: true, message: "..." }`

## Next Steps

Follow the comprehensive plan in `BUILD_PLAN.md`:
1. ✅ Phase 1: Project Setup (COMPLETE)
2. Phase 2: Database Implementation
3. Phase 3: API Development
4. Phase 4: ActiveCampaign Integration
5. Phase 5: Report Generation
6. Phase 6: Frontend Integration
7. Phase 7: Testing
8. Phase 8: Deployment
9. Phase 9: Analytics

## Support

See `BUILD_PLAN.md` for detailed implementation guidance and troubleshooting.

## License

ISC
