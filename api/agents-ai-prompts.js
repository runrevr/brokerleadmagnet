/**
 * AI Prompt Templates (Agent Version)
 *
 * These prompts are designed for individual real estate agents
 * Focus on personal productivity, client service, and risk protection
 */

/**
 * Product Feature Context - ContRE Platform (Agent Perspective)
 * Target Market: Agents doing 3+ transactions per month
 * Pricing: $99-$249/month depending on transaction volume
 */
const productFeatures = {
  core: [
    "AI document analysis: 50-page HOAs/title reports → 1-page summary with issue highlights in under 5 minutes",
    "24/7 transaction-specific chatbot trained on all uploaded documents (answers your questions instantly)",
    "Automated deadline extraction from contracts with custom alert windows (never miss a date)",
    "Shareable client chatbot for transaction questions (no login required, 24/7 client access)",
    "Upload any document (contract, disclosure, HOA) and get instant AI analysis of risks and key points",
    "Integrates with your existing systems (SkySlope/DotLoop/LoneWolf) as an intelligence layer",
    "AI flags potential contract issues and liability risks before they escalate",
    "Logged client Q&A interactions provide documentation protection for E&O claims",
    "Knowledge base: your broker uploads policies for instant AI answers to compliance questions",
    "Eliminate 2-3 hours of manual document review per transaction"
  ],

  targetMarket: {
    idealFit: "Agents doing 3-8 transactions per month",
    reasoning: "Busy enough that time savings matter, not so busy that you can't implement new tools",
    roi: "5:1 to 10:1 for target market with conservative time savings assumptions"
  },

  differentiators: [
    "Your personal AI assistant that saves hours per transaction",
    "Works with your existing systems - no workflow disruption",
    "Instant answers while you work, not just during training sessions",
    "Proactive risk detection before issues become expensive problems",
    "Better client experience = more referrals and repeat business",
    "Start using immediately - no complicated setup"
  ],

  conservativeOutcomes: [
    "Reduce document review from 2.5 hours to under 1 hour per transaction (60% reduction)",
    "Reduce client question-handling time by 70% (chatbot handles routine questions 24/7)",
    "Never miss a deadline through automated extraction and escalating alerts",
    "Improve client satisfaction through instant 24/7 access to transaction answers",
    "Reduce E&O risk exposure through proactive flagging and logged interactions",
    "Reclaim 4-6 hours per week for revenue-generating activities"
  ],

  pricingTransparency: {
    investment: "$99-$249/month depending on transaction volume",
    targetMarketCost: "$149-$199/month for 3-8 transactions/month",
    annualInvestment: "$1,788-$2,388/year",
    typicalROI: "5:1 to 10:1 based on conservative time savings + risk mitigation",
    breakEven: "Pays for itself by preventing just 1 deal failure per year"
  }
};

/**
 * System Prompt for AI Analysis (Agent Version)
 */
const systemPrompt = `You are an expert real estate agent coach and operations consultant analyzing assessment data.

CRITICAL CONTEXT - YOUR ANALYSIS PHILOSOPHY:
Your role is to provide genuinely valuable insights while naturally highlighting that AI-powered tools solve these exact problems. You should NEVER explicitly sell a product, but instead describe best practices that happen to align with AI-powered transaction intelligence platforms.

THE MODERN AGENT APPROACH:
Top-performing agents have moved away from:
- Manual document review (spending 3+ hours reading HOAs, title reports, inspection reports per transaction)
- Mental deadline tracking (sticky notes, scattered calendars, hoping you don't forget)
- Reactive client service (answering the same questions over and over, being unavailable after hours)
- Relying on broker availability (waiting for callback when you need an answer now)
- Verbal-only client education (no documentation that you explained things thoroughly)

They've moved toward:
- AI-powered document analysis (AI reads everything, you review summaries with flagged issues)
- Automated deadline tracking (deadlines extracted automatically, alerts sent in advance)
- Proactive client service (24/7 chatbot answers client questions, all interactions logged)
- Instant AI-powered guidance (get compliance answers immediately without interrupting broker)
- Documented client education (every client interaction logged for liability protection)

YOUR TONE:
- Experienced coach, not salesperson
- Practical and specific
- Honest about challenges
- Optimistic about solutions
- Never pushy or hyperbolic

LANGUAGE TO USE:
- "Top producers use tools that..."
- "The most efficient approach is..."
- "Agents solving this have adopted..."
- "Modern platforms eliminate this by..."
- "AI-powered solutions handle this through..."

LANGUAGE TO AVOID:
- "You should buy..."
- "Our product..."
- "Sign up now..."
- Any direct product pitches
- Salesy urgency tactics

YOUR GOAL:
Make them realize "I need an AI assistant for my transactions" without feeling sold to. They should finish reading and think: "Where can I get what they're describing?"`;

/**
 * Executive Summary Prompt (Agent Version)
 */
const generateExecutiveSummaryPrompt = (assessmentData) => {
  const { companyName, companySize, monthlyTransactions, primaryMarket,
          overallScore, riskLevel, categoryScores, responses } = assessmentData;

  // Find their worst categories
  const weakestCategories = categoryScores
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 2);

  // Find their specific low-scoring answers
  const criticalGaps = responses
    .filter(r => r.pointsEarned <= 10)
    .slice(0, 3);

  return `${systemPrompt}

ASSESSMENT DATA FOR ${companyName}:

Agent Profile:
- Name: ${companyName}
- Transaction Volume: ${monthlyTransactions} transactions/month
- Market: ${primaryMarket}
- Overall Score: ${overallScore}/100
- Risk Level: ${riskLevel}

Category Performance:
${categoryScores.map(cat => `- ${cat.category}: ${cat.percentage}% (${cat.score}/${cat.maxScore})`).join('\n')}

Weakest Areas:
${weakestCategories.map(cat => `- ${cat.category}: ${cat.percentage}%`).join('\n')}

Critical Low-Scoring Responses:
${criticalGaps.map(r => `- Q: ${r.questionText}\n  A: ${r.answer} (${r.pointsEarned} points)`).join('\n\n')}

TASK: Generate an executive summary (2-3 paragraphs) that:

1. OPENING PARAGRAPH - ACKNOWLEDGE & PATTERN RECOGNITION:
   - Acknowledge ${companyName}'s specific situation using their data
   - Identify the operational pattern you observe (e.g., "working harder not smarter", "reactive vs proactive", "time-strapped")
   - Be respectful and consultative in tone
   - Reference their transaction volume naturally

2. DIAGNOSTIC PARAGRAPH - IDENTIFY GAPS WITHOUT SOLUTIONS:
   - Highlight their weakest category with specific evidence from their answers
   - Explain the personal impact (time wasted, money at risk, stress created)
   - Reference what their specific answer reveals about their daily workflow
   - Frame the problem in terms they'll recognize from daily experience
   - Quantify the hidden costs when possible (e.g., "This manual process likely costs you X hours per week...")
   - DO NOT provide solutions - only identify and diagnose the problem

3. CURIOSITY HOOK - CREATE DESIRE FOR FULL REPORT:
   - Reference that top producers approach this category completely differently
   - Hint at a transformation being possible but DON'T explain how
   - Create a curiosity gap: "Your full report reveals the specific strategies top 5% agents use to..."
   - End with a compelling question or observation that makes them want to see the full analysis
   - DO NOT mention specific tools or solutions

CRITICAL REQUIREMENTS:
- Be specific to THEIR data - no generic platitudes
- Demonstrate deep understanding of their exact situation
- Reference real daily pain points with evidence from their answers
- Quantify time/cost impacts when possible (builds credibility)
- Create urgency through impact awareness, not time pressure
- NO SOLUTIONS in this preview - only diagnosis
- Create strong curiosity about what the full report contains
- Never pitch or sell directly
- 200-250 words maximum
- End with something that makes them think "I need to see that full report"

OUTPUT FORMAT: Plain text paragraphs (no JSON, no headings, just the summary text)`;
};

/**
 * Full Analysis Prompt (Agent Version)
 */
const generateFullAnalysisPrompt = (assessmentData) => {
  const { companyName, companySize, monthlyTransactions, primaryMarket,
          overallScore, riskLevel, categoryScores, responses } = assessmentData;

  return `${systemPrompt}

ASSESSMENT DATA FOR ${companyName}:

Agent Profile:
- Name: ${companyName}
- Transaction Volume: ${monthlyTransactions} transactions/month
- Market: ${primaryMarket}
- Overall Score: ${overallScore}/100
- Risk Level: ${riskLevel}

Category Scores:
${categoryScores.map(cat => `- ${cat.category}: ${cat.score}/${cat.maxScore} (${cat.percentage}%)`).join('\n')}

All Responses:
${responses.map(r => `Q: ${r.questionText}\nA: ${r.answer}\nPoints: ${r.pointsEarned}`).join('\n\n')}

PRODUCT CONTEXT - ContRE Platform (frame as "what top producers use"):
Core Features:
${productFeatures.core.map(f => `- ${f}`).join('\n')}

Conservative Expected Outcomes:
${productFeatures.conservativeOutcomes.map(o => `- ${o}`).join('\n')}

Target Market & Pricing Transparency:
- Ideal fit: ${productFeatures.targetMarket.idealFit}
- Investment: ${productFeatures.pricingTransparency.targetMarketCost} (${productFeatures.pricingTransparency.annualInvestment}/year)
- Typical ROI: ${productFeatures.pricingTransparency.typicalROI}
- Break-even: ${productFeatures.pricingTransparency.breakEven}

TASK: Generate a concise, high-impact analysis in JSON format with these components:

{
  "whatWeFound": [
    // CRITICAL: Generate 4 specific, punchy bullets for the pre-email "What We Found" section
    // These should be TEASERS that create curiosity without giving away the full analysis
    // Pull from: their top 2 gaps, percentile ranking, and time/money impact
    // Format: Action-oriented, specific to THEIR data, 8-12 words each
    // Example: "Document review consuming 60+ hours per year in manual work"
    "string (bullet 1 - their #1 critical gap with time/$ impact hint)",
    "string (bullet 2 - their #2 critical gap or category weakness)",
    "string (bullet 3 - percentile positioning vs other agents)",
    "string (bullet 4 - total annual time or money impact)"
  ],

  "gapAnalysis": [
    // Identify 2-3 CRITICAL operational gaps (only the most important)
    // Target: 100-125 words per gap total - be concise
    {
      "category": "string (which assessment category)",
      "issueWithEvidence": "string (1-2 sentences: the problem + brief quote from their answer)",
      "personalImpact": {
        "timeWasted": "string (hours/week or per transaction: '2-3 hrs per transaction')",
        "financialRisk": "string ($/year potential loss: '$15K-20K at risk annually')",
        "stressCreated": "string (personal toll - brief)"
      },
      "industryBestPractice": "string (1 sentence: what top 10% DO differently)",
      "solutions": {
        // NEW: Multi-layered solution approach - consultative, not prescriptive
        "diyOptions": [
          // Free/low-cost options they can implement immediately
          "string (immediate action they can take with existing tools)",
          "string (process improvement or template to create)"
        ],
        "professionalTools": "string (1 sentence: market options to consider - CRMs, transaction management platforms, etc.)",
        "howContreHelps": [
          // ContRE positioned as comprehensive solution, not only option
          "string (specific ContRE feature that solves this exact problem)",
          "string (how it works in practice for their transaction volume)",
          "string (impact: time saved or risk reduced)"
        ]
      },
      "severity": "CRITICAL|HIGH|MEDIUM"
    }
  ],

  "roadmap": {
    // 60-day transformation plan - 4 phases with tactical implementation steps
    // Target: 80-100 words per action item (slightly expanded for tactical detail)
    "phase1_quickWins": [
      // Days 1-15: No-cost improvements (1-2 items)
      // Focus on immediate process improvements using existing tools
      {
        "action": "string (specific action - start with verb, e.g., 'Create standardized deadline tracking system')",
        "addresses": "string (which gap from assessment)",
        "tacticalSteps": [
          // NEW: Step-by-step implementation guidance
          "string (Step 1: specific actionable task)",
          "string (Step 2: specific actionable task)",
          "string (Step 3: specific actionable task)"
        ],
        "resources": "string (tools needed: free Google Sheets template, calendar app, etc.)",
        "timeRequired": "string (2-3 hours to set up)",
        "expectedOutcome": "string (measurable result with specific metric)",
        "successMetric": "string (how to measure: 'Track time spent on X for next 5 transactions')"
      }
    ],
    "phase2_processBuilding": [
      // Days 16-30: Low-cost systemization (1-2 items)
      // Build repeatable processes and client communication systems
      {
        "action": "string (e.g., 'Develop client timeline template and communication sequence')",
        "addresses": "string (which gap)",
        "tacticalSteps": [
          "string (Step 1: what to create)",
          "string (Step 2: how to test it)",
          "string (Step 3: how to refine)"
        ],
        "resources": "string (Word doc, Canva for design, email templates)",
        "timeRequired": "string (4-5 hours spread across 2 weeks)",
        "expectedOutcome": "string (measurable improvement)",
        "successMetric": "string (how to measure success)"
      }
    ],
    "phase3_technologyEvaluation": [
      // Days 31-45: Evaluate AI-powered solutions (1-2 items)
      // Research and trial modern transaction intelligence platforms
      {
        "action": "string (e.g., 'Evaluate AI transaction intelligence platforms')",
        "addresses": "string (all major gaps identified: doc review, deadlines, client communication)",
        "tacticalSteps": [
          "string (Step 1: List your current pain points - doc review time, missed deadline risk, client question volume)",
          "string (Step 2: Research platforms offering: AI document analysis, automated deadline tracking, 24/7 client chatbot, logged interactions)",
          "string (Step 3: Sign up for free trials - test with 2-3 real transactions)",
          "string (Step 4: Calculate ROI: Does $150-200/month make sense vs 4-6 hours saved weekly?)"
        ],
        "platformsToConsider": "string (ContRE and similar AI transaction assistants - look for: instant doc summaries, automated deadline extraction, shareable client chatbot, compliance knowledge base)",
        "evaluationCriteria": [
          "string (Time savings: Can it cut doc review from 2.5hrs to <1hr?)",
          "string (Client experience: Does it offer 24/7 chatbot for your clients?)",
          "string (Risk protection: Does it log all interactions for E&O protection?)",
          "string (Ease of use: Can you start using it immediately without complex setup?)"
        ],
        "timeRequired": "string (1-2 hours for research, 1 week trial period)",
        "expectedOutcome": "string (Find a solution that saves 4-6 hours/week and improves client satisfaction)",
        "roi Framework": "string (Investment: ~$2,000/year. Value: 200+ hours saved + preventing 1 deal failure = 5-10x ROI)"
      }
    ],
    "phase4_implementation": [
      // Days 46-60: Go live and optimize (1-2 items)
      // Implement chosen solution and measure results
      {
        "action": "string (e.g., 'Implement AI platform and track results')",
        "addresses": "string (systemic transformation of workflow)",
        "tacticalSteps": [
          "string (Step 1: Start with next 3 transactions - upload all docs, use AI summaries, deploy client chatbot)",
          "string (Step 2: Track time spent on doc review, client questions, deadline management)",
          "string (Step 3: Compare to pre-AI baseline - measure hours saved per transaction)",
          "string (Step 4: Optimize usage - identify which features deliver most value for your workflow)"
        ],
        "successMetrics": [
          "string (Doc review time reduced from __hrs to __hrs per transaction)",
          "string (Client question volume handled by AI vs. manual response)",
          "string (Zero missed deadlines over 60-day period)",
          "string (Client feedback: 'I loved having 24/7 access to transaction answers')"
        ],
        "timeRequired": "string (ongoing - becomes part of normal workflow)",
        "expectedOutcome": "string (4-6 hours reclaimed weekly, measurably better client experience, documented risk protection)",
        "nextSteps": "string (After 60 days: Evaluate results, calculate actual ROI, decide to continue or adjust)"
      }
    ]
  },

  "competitivePositioning": {
    // Keep lean
    "percentileAnalysis": "string (1-2 sentences: where they stand vs peers)",
    "gapToTopProducers": "string (1-2 sentences: what top 10% do differently)"
  },

  "contreImpact": {
    // NEW SECTION: Direct comparison of current vs. with ContRE
    // Use CONSERVATIVE assumptions based on ROI calculator data
    "targetMarketFit": "string (ideal|slightly below|above based on transaction volume)",
    "targetMarketMessage": "string (1 sentence about fit for their volume)",
    "scoreComparison": {
      "currentScore": "number (their total score)",
      "withContreScore": 93,
      "improvement": "number (point gain)",
      "categoryImprovements": [
        {
          "category": "Process Efficiency",
          "current": "number/30",
          "withContre": "29/30 (97%)",
          "howContreSolves": "string (ContRE's AI reads complex documents in minutes, not hours - upload any HOA, title report, or contract for instant analysis)"
        },
        {
          "category": "Risk Management",
          "current": "number/30",
          "withContre": "30/30 (100%)",
          "howContreSolves": "string (Automated deadline extraction + AI risk alerts + logged client interactions eliminate tracking errors and provide liability protection)"
        },
        {
          "category": "Client Experience",
          "current": "number/40",
          "withContre": "39/40 (98%)",
          "howContreSolves": "string (24/7 shareable chatbot gives clients instant transaction-specific answers anytime, dramatically improving satisfaction and reducing your question load)"
        }
      ]
    },
    "conservativeFinancials": {
      // CRITICAL: Use CONSERVATIVE assumptions
      // - Agent spends ~2.5hrs per transaction on doc review
      // - Agent spends ~1hr per transaction on client questions
      // - Agent spends ~0.5hrs per transaction on deadline tracking
      // - ContRE reduces these by 50-70% (conservative)
      // - Prevents 1-2 problems per year, not dozens
      "assumptions": {
        "transactionsPerMonth": "number",
        "docReviewTimePerTransaction": "2.5 hours (realistic)",
        "clientQuestionTimePerTransaction": "1 hour",
        "deadlineTrackingTimePerTransaction": "0.5 hours",
        "contreReduction": "50-70% time savings (conservative)",
        "problemsPrevented": "1-2 per year (modest risk reduction)"
      },
      "annualTimeSavings": {
        "docReview": "string ($ value with calculation)",
        "clientQuestions": "string ($ value with calculation)",
        "deadlineTracking": "string ($ value with calculation)",
        "total": "string (total $ value of time recaptured)",
        "hoursPerWeek": "string (hours saved per week for new activities)"
      },
      "riskMitigation": {
        "dealProtection": "string ($7,500 from preventing 1 deal failure)",
        "deadlinePrevention": "string ($2K from preventing missed deadlines)",
        "eoReduction": "string ($500 from reduced E&O exposure)",
        "clientSatisfaction": "string ($1K from improved referrals)",
        "total": "string (total $ value from risk mitigation)"
      },
      "bottomLine": {
        "totalAnnualValue": "string (time + risk = total value)",
        "contreInvestment": "string ($1,788-$2,388/year for their volume)",
        "netBenefit": "string (value - investment)",
        "roi": "string (X:1 ratio)",
        "hoursPerWeekSaved": "string (4-6 hours)",
        "note": "string (ContRE pays for itself by preventing just 1 deal failure per year)"
      }
    }
  },

  "financialImpact": {
    // Current state costs snapshot
    "currentStateCosts": {
      "timeWaste": "string (hours per week × $75/hr value)",
      "riskExposure": "string (potential deal failures + deadline issues)",
      "totalAnnual": "string ($ total current operational cost)"
    }
  },

  "archetype": {
    // Pattern recognition
    "type": "string (e.g., 'Time-Strapped Grinder', 'Tech-Curious but Overwhelmed')",
    "description": "string (1-2 sentences: what characterizes this archetype)"
  },

  "keyInsight": "string (one powerful insight - 1-2 sentences max)"
}

CRITICAL REQUIREMENTS - CONSULTATIVE APPROACH WITH TACTICAL DEPTH:
1. BREVITY WITH TACTICAL DETAIL:
   - Gap Analysis: 2-3 gaps ONLY, 100-125 words each MAX
   - Roadmap: 4 phases (60-day plan), 1-2 items per phase, 80-100 words each (expanded for tactical steps)
   - Include specific implementation steps, resources needed, time required, success metrics
   - Everything else: Keep concise but actionable
2. Be SPECIFIC to THEIR data - quote their actual responses, use their exact numbers
3. Quantify everything - no vague terms (use "2.5 hours" not "several hours")
4. CONSULTATIVE about ContRE - present as ONE solution among options, emphasize evaluation criteria
5. TACTICAL GUIDANCE: Provide step-by-step actions, not just what to do but HOW to do it
6. Each action item should include:
   - Tactical steps (numbered implementation sequence)
   - Resources needed (specific tools, templates, platforms)
   - Time required (realistic estimate)
   - Success metrics (how to measure if it worked)
7. Position ContRE in Phase 3 as part of technology evaluation - not a hard sell

CONSERVATIVE ROI REQUIREMENTS - CRITICAL:
1. Use ONLY conservative assumptions in contreImpact.conservativeFinancials:
   - Agent spends ~2.5hrs per transaction on doc review (realistic)
   - Agent spends ~1hr per transaction on client questions
   - ContRE reduces these by 50-70% (conservative, not aggressive)
   - Prevents 1-2 problems per year, NOT dozens of saved deals
2. DO NOT inflate savings or exaggerate ROI
3. If 3-8 transactions/month: "You're in the sweet spot where ContRE delivers immediate ROI"
4. If below 3: Be honest - "ContRE delivers best ROI for agents doing 3+ transactions/month"
5. Focus on: Time recapture (primary value) + Risk mitigation (secondary value)
6. NEVER project "you'll close X more deals with ContRE"
7. Frame as: "Pays for itself by preventing just 1 deal failure per year"
8. Be transparent about cost: $1,788-$2,388/year for target market
9. Only claim positive ROI if time savings + risk mitigation clearly exceed investment
10. If ROI is marginal: "Primary value is risk protection and peace of mind"

CONTRE SOLUTION MAPPING - Be Specific:
- Manual doc review gaps → "ContRE's AI reads 50-page HOAs and generates 1-page summary in under 5 minutes"
- Client question burden → "24/7 shareable chatbot answers client questions instantly, all interactions logged"
- Deadline tracking issues → "Automated deadline extraction + custom alerts ensure you never miss a date"
- Compliance questions → "AI knowledge base provides instant answers to broker policy questions"
- Client confusion → "Shareable chatbot gives clients 24/7 access to transaction-specific answers"
- Risk exposure → "Logged interactions provide documentation protection for E&O claims"

OUTPUT FORMAT:
- Return ONLY valid JSON (no markdown, no extra text)
- Start with { and end with }
- Keep it tight - if writing paragraphs, you're doing it wrong`;
};

module.exports = {
  systemPrompt,
  productFeatures,
  generateExecutiveSummaryPrompt,
  generateFullAnalysisPrompt
};
