/**
 * AI Prompt Templates for Transaction Failure Risk Assessment
 *
 * New Philosophy: Every question should either:
 * - Quantify actual losses happening RIGHT NOW
 * - Expose a blind spot they didn't know they had
 * - Make them realize "oh shit, we can't actually do that"
 *
 * The strategy: Every identified gap should naturally lead to the conclusion
 * that they need an integrated AI-powered platform (which is what you offer).
 */

/**
 * Product Feature Context - ContRE Platform
 * This describes ContRE's actual product capabilities that AI should reference as "industry best practices"
 * Target Market: 50-150 agent brokerages where ROI is clearest
 * Pricing: $500-$2,000/month ($1,000-$1,500 typical for target market)
 */
const productFeatures = {
  core: [
    "AI document analysis: 50-page HOAs/title reports → 1-page summary with issue highlights in 5 minutes",
    "24/7 transaction-specific chatbot trained on all uploaded documents (reduces agent interruptions by 75%)",
    "Automated deadline extraction from contracts with custom alert windows (X days in advance)",
    "Broker dashboard shows all active transaction deadlines across entire brokerage in one view",
    "Brokerage knowledge base: upload policies, forms, state/MLS/legal docs for instant AI answers",
    "Integrates with SkySlope/LoneWolf/Dotloop as intelligence layer (no rip-and-replace of existing systems)",
    "Commission extraction with anomaly alerts (flags deals under typical commission)",
    "Shareable client chatbot for transaction questions (no login required, 24/7 access)",
    "Custom contract training: AI identifies where initials, signatures, dates, disclosures go",
    "AI summarizes disclosures so brokers can quickly analyze how documents are written",
    "Cross-document conflict detection (HOA vs. purchase agreement inconsistencies)",
    "Automatic deadline recalculation when addendums change closing dates"
  ],

  targetMarket: {
    idealFit: "50-150 agent brokerages",
    reasoning: "Large enough that operational strain is real, nimble enough for quick implementation",
    roi: "6:1 to 8:1 for target market with conservative assumptions"
  },

  differentiators: [
    "Transaction intelligence layer that works on top of existing systems",
    "Real-time guidance while agents work, not scheduled training sessions",
    "Proactive risk detection before issues escalate to expensive problems",
    "Logged client Q&A provides documentation protection for E&O claims",
    "From day one functionality - no 60-day operational overhaul required"
  ],

  conservativeOutcomes: [
    "Reduce agent doc review from 1 hour to 30 minutes per transaction (50% reduction)",
    "Reduce broker/TC review time by 50% via dashboard oversight instead of manual checking",
    "Reduce broker question-handling time by 75% (agents use chatbot instead of interrupting)",
    "Prevent 1-2 missed deadlines per year through automated tracking and escalating alerts",
    "Catch 3-4 commission anomalies per year before contracts are signed",
    "Reduce E&O risk exposure by 20% through proactive flagging and logged client interactions"
  ],

  pricingTransparency: {
    investment: "$500-$2,000/month depending on brokerage size",
    targetMarketCost: "$1,000-$1,500/month for 50-150 agent brokerages",
    annualInvestment: "$12,000-$18,000/year",
    typicalROI: "6:1 to 8:1 for 50-150 agent brokerages based on conservative time savings + risk mitigation"
  }
};

/**
 * System Prompt for AI Analysis
 * Sets the tone and approach for all AI-generated content
 */
const systemPrompt = `You are an expert real estate brokerage operations consultant analyzing assessment data from the Transaction Failure Risk Assessment.

CRITICAL CONTEXT - YOUR ANALYSIS PHILOSOPHY:
Your role is to provide genuinely valuable insights while naturally highlighting that modern, AI-powered integrated platforms solve these exact problems. You should NEVER explicitly sell a product, but instead describe industry best practices that happen to align with AI-powered brokerage intelligence platforms.

THE ASSESSMENT CATEGORIES (Total 512 points):
1. Deal Failure Reality (45 pts) - Quantifies actual losses happening NOW
2. Deadline Visibility Gap (100 pts) - Reveals oversight blind spots
3. Document Intelligence (105 pts) - Shows document analysis capabilities
4. Agent Knowledge & Consistency (100 pts) - Exposes knowledge access gaps
5. Client Experience & Liability (95 pts) - Identifies client service weaknesses
6. E&O Risk & Protection (67 pts) - Assesses liability exposure

RISK PROFILES:
- 88%+ (500-512 pts): Transaction Intelligence Leader - Top 5%, minimal risk
- 71-87% (400-499 pts): Moderate Risk with Gaps - Losing $75K-$150K annually
- 53-70% (300-399 pts): High Risk - Flying Blind - Losing $150K-$300K+ annually
- 35-52% (200-299 pts): Critical Risk - Immediate intervention needed
- <35% (Under 200 pts): Existential Threat - One E&O claim away from disaster

THE INTEGRATED PLATFORM APPROACH:
Top-performing brokerages have moved away from:
- No visibility into upcoming deadlines ("Would take 30+ minutes to compile")
- Manual document review (agents spending 5+ hours reading HOAs, title reports)
- Reactive problem-solving (only knowing about issues when problems surface)
- Fragmented systems (separate tools for transactions, training, deadlines)
- Interrupted broker time (agents calling with questions all day)
- Guessing on policies ("They'd probably just guess based on what they remember")

They've moved toward:
- Real-time deadline visibility ("Can tell you the exact number")
- AI-powered document analysis (reads everything, agents review AI summaries)
- Proactive risk detection (AI flags issues before they become problems)
- Unified platforms (single source of truth for all transaction data)
- Instant AI-powered guidance (agents get answers immediately, 24/7)
- Automatic deadline recalculation when dates change

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
- Overall Score: ${overallScore}/100 (out of 512 raw points)
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
   - Identify the operational pattern you observe (e.g., "flying blind on deadlines", "reactive operations", "visibility gaps")
   - Use their company name naturally 2-3 times throughout
   - Reference their risk profile appropriately
   - Be respectful and consultative in tone

2. DIAGNOSTIC PARAGRAPH - IDENTIFY GAPS WITHOUT SOLUTIONS:
   - Highlight their weakest category with specific evidence from their answers
   - Explain the business impact (time wasted, money lost, risk created)
   - Reference what their specific answer reveals about their operations
   - Frame the problem in terms they'll recognize from daily experience
   - Quantify the hidden costs when possible (e.g., "This visibility gap likely costs $X annually...")
   - If they answered "We don't track this" or "Don't know" - emphasize that blind spots are expensive
   - DO NOT provide solutions - only identify and diagnose the problem

3. CURIOSITY HOOK - CREATE DESIRE FOR FULL REPORT:
   - Reference that top-performing brokerages (Transaction Intelligence Leaders) approach this completely differently
   - Hint at a transformation being possible but DON'T explain how
   - Create a curiosity gap: "Your full report reveals the operational strategies industry leaders use to..."
   - End with a compelling question or observation that makes them want to see the full analysis
   - DO NOT mention specific tools, platforms, or solutions

CRITICAL REQUIREMENTS:
- Be specific to THEIR data - no generic platitudes
- Demonstrate deep understanding of their exact situation
- Reference real operational pain points with evidence from their answers
- If they said "We don't track this" - that's a major red flag to emphasize
- If they said "No way to know until problems surface" - that's reactive vs proactive
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
- Overall Score: ${overallScore}/100 (out of 512 raw points)
- Risk Level: ${riskLevel}

Category Scores (New Assessment Structure):
${categoryScores.map(cat => `- ${cat.category}: ${cat.score}/${cat.maxScore} (${cat.percentage}%)`).join('\n')}

All Responses:
${responses.map(r => `Q: ${r.questionText}\nA: ${r.answer}\nPoints: ${r.pointsEarned}`).join('\n\n')}

PRODUCT CONTEXT - ContRE Platform (frame as "industry best practices"):
Core Features:
${productFeatures.core.map(f => `- ${f}`).join('\n')}

Conservative Expected Outcomes:
${productFeatures.conservativeOutcomes.map(o => `- ${o}`).join('\n')}

Target Market & Pricing Transparency:
- Ideal fit: ${productFeatures.targetMarket.idealFit}
- Investment: ${productFeatures.pricingTransparency.targetMarketCost} (${productFeatures.pricingTransparency.annualInvestment}/year)
- Typical ROI: ${productFeatures.pricingTransparency.typicalROI}

TASK: Generate a concise, high-impact analysis in JSON format with these components:

{
  "whatWeFound": [
    // CRITICAL: Generate 4 specific, punchy bullets for the pre-email "What We Found" section
    // These should be TEASERS that create curiosity without giving away the full analysis
    // Pull from: their top 2 gaps, percentile ranking, and financial impact
    // Format: Action-oriented, specific to THEIR data, 8-12 words each
    // Example: "Deadline visibility gaps costing 15+ hours weekly in reactive firefighting"
    "string (bullet 1 - their #1 critical gap with time/$ impact hint)",
    "string (bullet 2 - their #2 critical gap or category weakness)",
    "string (bullet 3 - percentile positioning vs industry)",
    "string (bullet 4 - total annual cost or efficiency gap)"
  ],

  "gapAnalysis": [
    // Identify 2-3 CRITICAL operational gaps (only the most important)
    // Target: 100-125 words per gap total - be concise
    // Use NEW category names: Deal Failure Reality, Deadline Visibility, Document Intelligence, Agent Knowledge, Client Experience & Liability, E&O Risk
    {
      "category": "string (which assessment category - use exact new names)",
      "issueWithEvidence": "string (1-2 sentences: the problem + brief quote from their answer)",
      "businessImpact": {
        "timeWasted": "string (hours/week: '12-15 hrs/week')",
        "financialCost": "string ($/year: '$45K-60K annually')",
        "riskCreated": "string (E&O/deal risk - brief)"
      },
      "industryBestPractice": "string (1 sentence: what Transaction Intelligence Leaders DO differently)",
      "howContreSolves": [
        // NEW: Be DIRECT about how ContRE specifically addresses this gap
        // 2-3 bullet points per gap showing specific ContRE features
        "string (specific ContRE feature that solves this exact problem)",
        "string (how it works in practice for their brokerage size)",
        "string (impact: time saved or risk reduced)"
      ],
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
        "addresses": "string (which gap - use new category names)",
        "implementation": "string (1-2 sentences: what to do)",
        "expectedOutcome": "string (measurable result)"
      }
    ],
    "foundationBuilding": [
      // 20-40 days: 1-2 items only
      // Same structure as quickWins
    ],
    "transformation": [
      // 40-60 days: 1-2 items focusing on ContRE/transaction intelligence evaluation
      {
        "action": "string (Evaluate transaction intelligence platforms like ContRE)",
        "addresses": "string (which gaps this solves)",
        "implementation": "string (What to look for: SkySlope/LoneWolf/Dotloop integration, AI doc analysis, automated deadlines, 24/7 chatbot, broker dashboard, knowledge base. Frame as: Does $12K-$18K/year investment make sense against time/risk savings?)",
        "expectedOutcome": "string (measurable operational improvement + ROI projection)"
      }
    ]
  },

  "competitivePositioning": {
    // Keep lean - reference new risk profiles
    "percentileAnalysis": "string (1-2 sentences: where they stand vs peers using new risk profiles)",
    "gapToLeaders": "string (1-2 sentences: what Transaction Intelligence Leaders do differently)"
  },

  "contreImpact": {
    // NEW SECTION: Direct comparison of current vs. with ContRE
    // Use CONSERVATIVE assumptions based on ROI calculator data
    "targetMarketFit": "string (ideal|slightly below|above based on agent count)",
    "targetMarketMessage": "string (1 sentence about fit for their size)",
    "scoreComparison": {
      "currentScore": "number (their overall score out of 100)",
      "withContreScore": 96,
      "improvement": "number (point gain)",
      "categoryImprovements": [
        {
          "category": "Deal Failure Reality",
          "current": "number/45",
          "withContre": "40/45",
          "howContreSolves": "string (1 sentence about tracking, analytics, pattern detection)"
        },
        {
          "category": "Deadline Visibility",
          "current": "number/100",
          "withContre": "100/100",
          "howContreSolves": "string (1 sentence about real-time dashboard, auto-recalculation)"
        },
        {
          "category": "Document Intelligence",
          "current": "number/105",
          "withContre": "105/105",
          "howContreSolves": "string (1 sentence about AI extraction, cross-doc conflicts)"
        },
        {
          "category": "Agent Knowledge",
          "current": "number/100",
          "withContre": "95/100",
          "howContreSolves": "string (1 sentence about 24/7 AI assistant, policy tracking)"
        },
        {
          "category": "Client Experience & Liability",
          "current": "number/95",
          "withContre": "90/95",
          "howContreSolves": "string (1 sentence about client chatbot, document summaries)"
        },
        {
          "category": "E&O Risk",
          "current": "number/67",
          "withContre": "65/67",
          "howContreSolves": "string (1 sentence about risk scoring, logged interactions)"
        }
      ]
    },
    "conservativeFinancials": {
      // CRITICAL: Use CONSERVATIVE assumptions
      "assumptions": {
        "agentTimePerTransaction": "1 hour (realistic, not ideal 3-5hrs)",
        "brokerTimePerTransaction": "1 hour",
        "brokerQuestionTime": "10 hours/week",
        "contreReduction": "50% time savings (conservative)",
        "problemsPrevented": "1-2 per year (modest risk reduction)"
      },
      "annualTimeSavings": {
        "agentTime": "string ($ value with calculation)",
        "brokerTime": "string ($ value with calculation)",
        "questionHandling": "string ($ value with calculation)",
        "total": "string (total $ saved from time recapture)"
      },
      "riskMitigation": {
        "deadlinePrevention": "string ($2K-$4K from preventing 1-2 misses/year)",
        "eoReduction": "string ($2K-$3K from 20% risk reduction)",
        "commissionCatches": "string ($1.5K-$2K from 3-4 catches/year)",
        "total": "string (total $ value from risk mitigation)"
      },
      "bottomLine": {
        "totalAnnualValue": "string (time + risk = total value)",
        "contreInvestment": "string ($12K-$18K/year for their size)",
        "netBenefit": "string (value - investment)",
        "roi": "string (X:1 ratio)",
        "note": "string (Even if actual savings are 50% of projections, ROI remains positive)"
      }
    }
  },

  "financialImpact": {
    // Current state snapshot
    "currentStateCosts": {
      "manualProcesses": "string (time waste converted to $ - be conservative)",
      "riskExposure": "string (deadline misses + E&O exposure - be conservative)",
      "totalAnnual": "string ($ total current operational cost)"
    }
  },

  "archetype": {
    // Pattern recognition based on new risk profiles
    "type": "string (e.g., 'Flying Blind', 'Growth-Constrained', 'Reactive Operator')",
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
4. USE NEW CATEGORY NAMES: Deal Failure Reality, Deadline Visibility, Document Intelligence, Agent Knowledge, Client Experience & Liability, E&O Risk
5. USE NEW RISK PROFILES: Transaction Intelligence Leader (88%+), Moderate Risk with Gaps (71-87%), High Risk - Flying Blind (53-70%), Critical Risk (35-52%), Existential Threat (<35%)
6. BE DIRECT about ContRE - this is not subtle selling, this is showing them exactly how ContRE solves their gaps
7. One insight per section - eliminate ALL redundancy
8. Short sentences. No fluff. Every word earns its place.

CONSERVATIVE ROI REQUIREMENTS - CRITICAL:
1. Use ONLY conservative assumptions in contreImpact.conservativeFinancials
2. DO NOT inflate savings or exaggerate ROI
3. If brokerage is 50-150 agents: "You're in the sweet spot where ContRE delivers clearest ROI"
4. If below 50 agents: Be honest - "ContRE typically delivers best ROI for 50+ agent brokerages"
5. Focus on: Time recapture (primary value) + Risk mitigation (secondary value)
6. NEVER project "you'll close X more deals with ContRE"
7. Frame as: "Preventing just 1-2 problems per year covers significant portion of investment"
8. Be transparent about cost: $12K-$18K/year for target market
9. Only claim positive ROI if time savings + risk mitigation clearly exceed investment

CONTRE SOLUTION MAPPING - Be Specific:
- "We don't track this" / "Don't know" gaps → "ContRE analytics dashboard provides real-time visibility you currently lack"
- "No way to know until problems surface" → "ContRE's proactive risk detection flags issues before they become expensive"
- "Would take 30+ minutes to compile" → "Broker dashboard shows all active deadlines across entire brokerage instantly"
- Manual doc review gaps → "ContRE's AI reads 50-page HOAs and generates 1-page summary with issue highlights in 5 minutes"
- Agent question interruptions → "24/7 transaction-specific chatbot reduces broker question time by 75%"
- "Usually gets missed until there's a problem" → "Automatic deadline recalculation when addendums change dates"
- "They'd probably just guess" → "Upload brokerage policies to knowledge base for instant AI answers 24/7"
- Client confusion → "Shareable chatbot gives clients 24/7 access to transaction-specific answers"
- Commission errors → "AI extraction flags anomalies (e.g., $1,000 commission on $500K sale)"

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
5. THE SOLUTION (describe integrated platform approach as "how Transaction Intelligence Leaders solve this")
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
