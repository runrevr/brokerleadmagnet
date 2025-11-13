# Vercel Agent Deployment Guide

## Overview

This guide explains how to deploy the Agent Lead Magnet as a **separate Vercel project** from the Brokerage Lead Magnet.

## Architecture

You have TWO separate Vercel projects:

1. **Brokerage Project** (connected to `main` branch)
   - Serves the brokerage assessment at root URL
   - Uses `index.html`, `report.html`, and brokerage API endpoints

2. **Agent Project** (connected to `agent-deployment` branch)
   - Serves the agent assessment at root URL
   - Uses `agents.html`, `agents-report.html`, and agent API endpoints

## Required Environment Variables

In your **Agent Vercel Project Settings**, configure these environment variables:

### Database (Required)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### AI Generation (Required)
```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Email Marketing (Optional)
```
ACTIVECAMPAIGN_API_URL=https://youraccountname.api-us1.com
ACTIVECAMPAIGN_API_KEY=your-api-key-here
```

## Vercel Project Configuration

### Production Branch
- Set to: `agent-deployment`
- This ensures deployments happen from the correct branch

### Build & Output Settings
- **Framework Preset**: Other
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`

### Root Directory
- Set to: `/` (root of repository)

## File Structure for Agent Project

The following files are used by the agent deployment:

### HTML Pages
- `agents.html` - Landing page with assessment
- `agents-report.html` - Report page with results

### API Endpoints (in `/api` directory)
- `agents-assessment-submit.js` - Save assessment and generate AI content
- `agents-report-get.js` - Retrieve report by shareable token
- `agents-email-capture.js` - Capture email and send report
- `agents-roi-calculator.js` - ROI calculations for agents
- `agents-ai-prompts.js` - AI prompt templates

### Supporting Files
- `agents-scoring-algorithm.js` - Scoring logic for agents
- `ai-integration.js` - AI generation integration
- `api/db.js` - Supabase client setup

### Configuration Files
- `vercel.json` - Routing and headers configuration
- `.vercelignore` - Files to exclude from deployment
- `package.json` - Dependencies

## Current Routing Configuration

The `vercel.json` on `agent-deployment` branch is configured as:

```json
{
  "rewrites": [
    { "source": "/", "destination": "/agents.html" },
    { "source": "/report", "destination": "/agents-report.html" },
    { "source": "/agents-report.html", "destination": "/agents-report.html" },
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ]
    },
    {
      "source": "/(.*)\\.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    }
  ]
}
```

This configuration:
- Routes `/` to the agent landing page
- Routes `/report` to the agent report page
- Properly handles API requests
- Sets CORS headers for API endpoints
- Prevents HTML file caching

## Deployment Steps

### Initial Setup (One-Time)

1. **Create New Vercel Project**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Import the same GitHub repository
   - Give it a different name (e.g., "leadmagnet-agents")

2. **Configure Git Branch**
   - In Project Settings → Git
   - Set Production Branch to: `agent-deployment`

3. **Add Environment Variables**
   - In Project Settings → Environment Variables
   - Add all variables listed above
   - Apply to: Production, Preview, and Development

4. **Verify Build Settings**
   - In Project Settings → General
   - Framework Preset: Other
   - Build Command: (empty)
   - Output Directory: (empty)

### Ongoing Deployments

Every push to the `agent-deployment` branch will automatically trigger a deployment.

To manually deploy:
1. Make changes on `agent-deployment` branch
2. Commit and push: `git push origin agent-deployment`
3. Vercel will automatically build and deploy

## Testing Your Deployment

After deployment, test the following:

### 1. Landing Page
Visit: `https://your-agent-project.vercel.app/`
- Should load the agent assessment page
- All questions should display correctly
- Company info form should work

### 2. Assessment Submission
Complete the assessment:
- Fill out company information
- Answer all questions
- Submit the assessment
- Should show loading state with progress

### 3. Report Generation
After submission:
- Should redirect to report page
- Report should display assessment results
- AI-generated content should appear
- All scores and metrics should be visible

### 4. Email Capture
On the report page:
- Enter email address
- Submit email form
- Should receive confirmation
- Check that email is sent (if ActiveCampaign configured)

### 5. Shareable Links
- Copy the shareable report link
- Open in incognito/private window
- Should load the report without needing to complete assessment
- All report data should be visible

### 6. API Endpoints
Test directly via browser or Postman:
- `GET /api/agents-report-get?token=<shareable-token>` - Should return report data
- Other endpoints require POST requests with proper body

## Common Issues & Solutions

### Issue: "Assessment submission failed"
**Solution:** Check that SUPABASE_URL and SUPABASE_ANON_KEY are set correctly in Vercel environment variables.

### Issue: "AI content not generating"
**Solution:** Verify ANTHROPIC_API_KEY is set and valid. Check Vercel function logs for errors.

### Issue: "Email not sending"
**Solution:** Check ACTIVECAMPAIGN_API_URL and ACTIVECAMPAIGN_API_KEY. Verify the ActiveCampaign list ID is correct.

### Issue: "Report page shows 404"
**Solution:** Ensure the shareable token is valid and hasn't expired (24 hours default).

### Issue: "CORS errors"
**Solution:** Verify the headers section in vercel.json includes the CORS headers for API routes.

### Issue: "Old HTML cached in browser"
**Solution:** The cache-control headers should prevent this, but you can hard refresh (Ctrl+Shift+R) to clear cache.

## Database Considerations

Both the Brokerage and Agent projects share the **same Supabase database**. The `assessments` table has an `assessment_type` column to differentiate:

- `assessment_type = 'brokerage'` - From brokerage project
- `assessment_type = 'agent'` - From agent project

This allows you to:
- Track both types of assessments in one place
- Run analytics across both
- Distinguish leads by type in reporting

## Monitoring & Logs

To view deployment logs and runtime errors:

1. **Deployment Logs**
   - Go to Vercel Dashboard → Your Agent Project
   - Click "Deployments" tab
   - Click on a deployment to see build logs

2. **Runtime Logs**
   - Go to Vercel Dashboard → Your Agent Project
   - Click "Logs" tab (or "Runtime Logs")
   - Filter by function (e.g., `api/agents-assessment-submit`)
   - View real-time console.log output

3. **Function Monitoring**
   - Go to "Functions" tab
   - See invocation counts, errors, and performance
   - Identify which endpoints are being used most

## Cost Considerations

Vercel Serverless Functions usage:
- **Free tier**: 100GB-Hrs per month
- Agent assessment submission can take 30-60 seconds (AI generation)
- Monitor usage in Vercel Dashboard → Usage

If exceeding free tier:
- Consider upgrading to Pro plan ($20/month)
- Or optimize by moving AI generation to async background job

## Next Steps

After successful deployment:

1. **Update Content** (see MANUAL-HTML-UPDATES-NEEDED.md)
   - Customize questions in agents.html
   - Update copy in agents-report.html
   - Add your branding/styling

2. **Configure ActiveCampaign**
   - Create "Agent" tag
   - Set up automation workflows
   - Test email deliverability

3. **Marketing Setup**
   - Share the agent Vercel URL with target audience
   - Create landing pages that link to agent assessment
   - Track conversions in Supabase

4. **Custom Domain** (Optional)
   - In Vercel Project Settings → Domains
   - Add custom domain (e.g., `agents.yourdomain.com`)
   - Update DNS records as instructed
   - Vercel will auto-provision SSL certificate

## Support

For issues with:
- **Vercel deployment**: Check Vercel documentation or contact Vercel support
- **Supabase**: Check Supabase logs and documentation
- **Anthropic AI**: Check API key validity and rate limits
- **ActiveCampaign**: Verify API credentials and list configuration
