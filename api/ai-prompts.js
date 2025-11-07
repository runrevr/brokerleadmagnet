/**
 * AI Prompt Templates
 *
 * These prompts are designed to make AI recommendations that "accidentally"
 * describe your product features without being salesy.
 *
 * The strategy: Every identified gap should naturally lead to the conclusion
 * that they need an integrated AI-powered platform (which is what you offer).
 */

/**
 * Product Feature Context
 * This describes your actual product capabilities that AI should reference as "industry best practices"
 */
const productFeatures = {
  core: [
    "AI-powered document analysis that reads HOAs, title reports, and inspection reports in minutes",
    "Automated deadline extraction and smart alerts for all transaction milestones",
    "Real-time transaction oversight with multi-layer verification (Agent + TC + Broker + AI)",
    "Centralized knowledge base with AI-powered instant answers to legal and procedural questions",
    "Client-facing dashboard with AI-generated summaries of all transaction documents",
    "Integrated commission calculation and reconciliation system",
    "Automated compliance tracking and risk flagging",
    "Single unified platform eliminating data silos across transaction management"
  ],
  differentiators: [
    "AI reads every document so agents don't have to spend 5+ hours per transaction",
    "Real-time guidance instead of scheduled training sessions",
    "Proactive risk detection before issues become expensive problems",
    "Client transparency through AI-generated plain-language summaries",
    "Verified seller lead generation with pay-at-contract model"
  ],
  outcomes: [
    "Reduce document review time from 5+ hours to under 30 minutes",
    "Eliminate missed deadlines with AI-extracted deadline tracking",
    "Reduce E&O claims through proactive compliance monitoring",
    "Improve client understanding with AI-generated document summaries",
    "Increase agent retention by reducing administrative burden",
    "Scale operations without proportional increase in overhead"
  ]
};

/**
 * System Prompt for AI Analysis
 * Sets the tone and approach for all AI-generated content
 */
const systemPrompt = `You are an expert real estate brokerage operations consultant analyzing assessment data.

CRITICAL CONTEXT - YOUR ANALYSIS PHILOSOPHY:
Your role is to provide genuinely valuable insights while naturally highlighting that modern, AI-powered integrated platforms solve these exact problems. You should NEVER explicitly sell a product, but instead describe industry best practices that happen to align with AI-powered brokerage intelligence platforms.

THE INTEGRATED PLATFORM APPROACH:
Top-performing brokerages have moved away from:
- Manual document review (agents spending 5+ hours reading HOAs, title reports, inspection reports)
- Fragmented systems (separate tools for transactions, training, deadlines, client communication)
- Reactive problem-solving (discovering issues at closing when it's expensive)
- Interrupted broker time (agents calling with questions all day)
- Training-based knowledge transfer (monthly sessions agents forget)

They've moved toward:
- AI-powered document analysis (reads everything, agents review AI summaries)
- Unified platforms (single source of truth for all transaction data)
- Proactive risk detection (AI flags issues before they become problems)
- Instant AI-powered guidance (agents get answers immediately, 24/7)
- Real-time knowledge access (AI provides cited answers instead of training sessions)

YOUR TONE:
- Consultative expert, not salesperson
- Data-driven and specific
- Honest about challenges
- Optimistic about solutions
- Never pushy or hyperbolic

LANGUAGE TO USE:
- "Top-performing brokerages use platforms that..."
- "The most scalable solution integrates..."
- "Brokerages solving this have adopted systems where..."
- "Modern platforms eliminate this by..."
- "AI-powered solutions handle this through..."

LANGUAGE TO AVOID:
- "You should buy..."
- "Our product..."
- "Sign up now..."
- Any direct product pitches
- Salesy urgency tactics

YOUR GOAL:
Make them realize "I need an AI-powered integrated platform" without feeling sold to. They should finish reading and think: "Where can I get what they're describing?"`;

/**
 * Executive Summary Prompt (Tier 1 - Instant Preview)
 * Generates 2-3 paragraph summary shown before email capture
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

Company Profile:
- Brokerage: ${companyName}
- Size: ${companySize} agents
- Volume: ${monthlyTransactions} transactions/month
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
   - Identify the operational pattern you observe (e.g., "growth outpacing systems", "fragmented operations", "reactive vs proactive")
   - Use their company name naturally 2-3 times throughout
   - Be respectful and consultative in tone

2. DIAGNOSTIC PARAGRAPH - IDENTIFY GAPS WITHOUT SOLUTIONS:
   - Highlight their weakest category with specific evidence from their answers
   - Explain the business impact (time wasted, money lost, risk created)
   - Reference what their specific answer reveals about their operations
   - Frame the problem in terms they'll recognize from daily experience
   - Quantify the hidden costs when possible (e.g., "This manual process likely costs $X annually...")
   - DO NOT provide solutions - only identify and diagnose the problem

3. CURIOSITY HOOK - CREATE DESIRE FOR FULL REPORT:
   - Reference that top-performing brokerages approach this category completely differently
   - Hint at a transformation being possible but DON'T explain how
   - Create a curiosity gap: "Your full report reveals the operational strategies industry leaders use to..."
   - End with a compelling question or observation that makes them want to see the full analysis
   - DO NOT mention specific tools, platforms, or solutions

CRITICAL REQUIREMENTS:
- Be specific to THEIR data - no generic platitudes
- Demonstrate deep understanding of their exact situation
- Reference real operational pain points with evidence from their answers
- Quantify costs/impacts when possible (builds credibility)
- Create urgency through impact awareness, not time pressure
- NO SOLUTIONS in this preview - only diagnosis
- Create strong curiosity about what the full report contains
- Never pitch or sell directly
- 200-250 words maximum
- End with something that makes them think "I need to see that full report"

OUTPUT FORMAT: Plain text paragraphs (no JSON, no headings, just the summary text)`;
};

/**
 * Full Analysis Prompt (Tier 2 - Email-Gated)
 * Generates comprehensive insights after email capture
 */
const generateFullAnalysisPrompt = (assessmentData) => {
  const { companyName, companySize, monthlyTransactions, primaryMarket,
          overallScore, riskLevel, categoryScores, responses } = assessmentData;

  return `${systemPrompt}

ASSESSMENT DATA FOR ${companyName}:

Company Profile:
- Brokerage: ${companyName}
- Size: ${companySize} agents
- Volume: ${monthlyTransactions} transactions/month
- Market: ${primaryMarket}
- Overall Score: ${overallScore}/100
- Risk Level: ${riskLevel}

Category Scores:
${categoryScores.map(cat => `- ${cat.category}: ${cat.score}/${cat.maxScore} (${cat.percentage}%)`).join('\n')}

All Responses:
${responses.map(r => `Q: ${r.questionText}\nA: ${r.answer}\nPoints: ${r.pointsEarned}`).join('\n\n')}

PRODUCT CONTEXT (frame as "industry best practices"):
${productFeatures.core.map(f => `- ${f}`).join('\n')}

Expected Outcomes from Integrated Platforms:
${productFeatures.outcomes.map(o => `- ${o}`).join('\n')}

TASK: Generate a concise, high-impact analysis in JSON format with these components:

{
  "whatWeFound": [
    // CRITICAL: Generate 4 specific, punchy bullets for the pre-email "What We Found" section
    // These should be TEASERS that create curiosity without giving away the full analysis
    // Pull from: their top 2 gaps, percentile ranking, and financial impact
    // Format: Action-oriented, specific to THEIR data, 8-12 words each
    // Example: "Transaction oversight gaps costing 15+ hours weekly in manual processes"
    "string (bullet 1 - their #1 critical gap with time/$ impact hint)",
    "string (bullet 2 - their #2 critical gap or category weakness)",
    "string (bullet 3 - percentile positioning vs industry)",
    "string (bullet 4 - total annual cost or efficiency gap)"
  ],

  "gapAnalysis": [
    // Identify 2-3 CRITICAL operational gaps (only the most important)
    // Target: 100-125 words per gap total - be concise
    {
      "category": "string (which assessment category)",
      "issueWithEvidence": "string (1-2 sentences: the problem + brief quote from their answer)",
      "businessImpact": {
        "timeWasted": "string (hours/week: '12-15 hrs/week')",
        "financialCost": "string ($/year: '$45K-60K annually')",
        "riskCreated": "string (E&O/deal risk - brief)"
      },
      "industryBestPractice": "string (1 sentence: what top 5% DO differently)",
      "severity": "CRITICAL|HIGH|MEDIUM"
    }
  ],

  "roadmap": {
    // 60-day action plan - prioritize impact
    // Target: 60-80 words per action item
    "quickWins": [
      // 0-20 days: 1-2 items only
      {
        "action": "string (specific action - start with verb)",
        "addresses": "string (which gap)",
        "implementation": "string (1-2 sentences: what to do)",
        "expectedOutcome": "string (measurable result)"
      }
    ],
    "foundationBuilding": [
      // 20-40 days: 1-2 items only
      // Same structure as quickWins
    ],
    "transformation": [
      // 40-60 days: 1-2 items only
      // Same structure as quickWins
    ]
  },

  "competitivePositioning": {
    // Keep lean
    "percentileAnalysis": "string (1-2 sentences: where they stand vs peers)",
    "gapToLeaders": "string (1-2 sentences: what top 10% do differently)"
  },

  "financialImpact": {
    // Numbers speak louder than words - keep explanations minimal
    "currentStateCosts": {
      "manualDocumentReview": "string ($ amount only with brief label: '$48K - 5hrs/transaction × 180 deals')",
      "missedDeadlines": "string ($ amount: '$30K - 6 deals/year at $5K avg concession')",
      "eoRisk": "string ($ amount: '$15K - elevated premiums + claim reserves')",
      "totalAnnual": "string ($ total - be conservative but compelling)"
    },
    "projectedSavings": {
      "timeReclaimed": "string (hours + $ value: '480 hrs/year → $28K value')",
      "dealsProtected": "string ($ saved: '$25K fewer concessions')",
      "riskReduction": "string ($ impact: '$12K premium reduction')",
      "totalAnnual": "string ($ total projected savings)",
      "roi": "string (simple ratio: '4:1 return' or '$4 saved per $1 invested')"
    }
  },

  "archetype": {
    // Pattern recognition
    "type": "string (e.g., 'Growth-Constrained', 'Tech-Forward but Disconnected')",
    "description": "string (1-2 sentences: what characterizes this archetype)"
  },

  "keyInsight": "string (one powerful insight - 1-2 sentences max)"
}

CRITICAL REQUIREMENTS - MAXIMUM BREVITY:
1. EXTREME BREVITY REQUIRED: Cut ruthlessly. This is a snapshot, not an essay.
   - Gap Analysis: 2-3 gaps ONLY, 100-125 words each MAX
   - Roadmap: 1-2 items per phase ONLY, 60-80 words each MAX
   - Everything else: Absolute minimum viable length
2. Be SPECIFIC to THEIR data - quote briefly, use their numbers
3. Quantify everything with specific numbers - no vague terms
4. NEVER sell - educate only
5. One insight per section - eliminate ALL redundancy
6. Short sentences. No fluff. Every word earns its place.

OUTPUT FORMAT:
- Return ONLY valid JSON (no markdown, no extra text)
- Start with { and end with }
- Keep it tight - if writing paragraphs, you're doing it wrong`;
};

/**
 * Category Deep-Dive Prompt (For Email Sequence)
 * Generates detailed analysis of their worst category for drip emails
 */
const generateCategoryDeepDivePrompt = (assessmentData, category) => {
  const { companyName, responses, categoryScores } = assessmentData;

  const categoryResponses = responses.filter(r =>
    r.questionText.includes(category) // simplified - would need better category mapping
  );

  const categoryScore = categoryScores.find(c => c.category.includes(category));

  return `${systemPrompt}

DEEP DIVE: ${category} for ${companyName}

Category Score: ${categoryScore.percentage}% (${categoryScore.score}/${categoryScore.maxScore})

Their Specific Answers:
${categoryResponses.map(r => `Q: ${r.questionText}\nA: ${r.answer}\nPoints: ${r.pointsEarned}`).join('\n\n')}

TASK: Write an engaging email (400-500 words) that:

1. SUBJECT LINE (create compelling subject)
2. OPENING (acknowledge their specific situation in this category)
3. THE PROBLEM (explain what their answers reveal - be specific)
4. THE COST (quantify time/money/risk this creates)
5. THE SOLUTION (describe integrated platform approach as "how leaders solve this")
6. CASE HINT (mention "brokerages like yours" that transformed this area)
7. CTA (soft: "Want to see how this works in practice?")

TONE: Helpful expert sharing insights, not salesperson pushing product

PRODUCT INTEGRATION: Naturally describe platform features as "modern approaches" and "what works"

OUTPUT FORMAT:
{
  "subject": "string",
  "body": "string (formatted with paragraphs, ready for email)"
}`;
};

module.exports = {
  systemPrompt,
  productFeatures,
  generateExecutiveSummaryPrompt,
  generateFullAnalysisPrompt,
  generateCategoryDeepDivePrompt
};
