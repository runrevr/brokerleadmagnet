/**
 * AI-Optimized Agent Performance Scoring Algorithm
 *
 * Evaluates real estate agents across 10 key performance dimensions
 * Total: 100 points (10 points per question)
 * Compares to AI-optimized benchmark (90-95 points achievable with ContRE)
 */

const scoringRules = {
    // Q1: Deadline Tracking (Business vs Calendar Days) (10 points)
    deadline_tracking: {
        weight: 10,
        scores: {
            "I have an automated system that calculates both types and sends alerts": 10,
            "I manually track on a spreadsheet/calendar with notes about which is which": 7,
            "I count them out as each deadline approaches": 4,
            "I rely on my TC or escrow officer to remind me of upcoming deadlines": 2
        },
        category: "risk_management",
        aiOptimized: "I have an automated system that calculates both types and sends alerts"
    },

    // Q2: Client Timeline Communication (10 points)
    client_timeline: {
        weight: 10,
        scores: {
            "Yes, I provide a comprehensive written timeline document with all milestones explained": 10,
            "I verbally walk them through the process but don't provide a written timeline": 6,
            "I send updates as we hit each milestone during the transaction": 5,
            "Clients reach out to me when they need updates on what's happening": 2
        },
        category: "client_experience",
        aiOptimized: "Yes, I provide a comprehensive written timeline document with all milestones explained"
    },

    // Q3: After-Hours Client Communication (10 points)
    after_hours_communication: {
        weight: 10,
        scores: {
            "They have 24/7 access to transaction information through technology I provide": 10,
            "They text or call me, and I respond when I'm available": 7,
            "They wait until the next business day to contact me": 4,
            "They usually figure it out or ask friends/family": 1
        },
        category: "client_experience",
        aiOptimized: "They have 24/7 access to transaction information through technology I provide"
    },

    // Q4: Cross-Document Analysis (10 points)
    cross_document_analysis: {
        weight: 10,
        scores: {
            "I use technology that automatically flags conflicts and inconsistencies across documents": 10,
            "I read everything carefully and take detailed notes to cross-reference": 8,
            "I focus on reading the key sections of each document type": 5,
            "I rely on title companies and escrow to catch major issues": 2
        },
        category: "process_efficiency",
        aiOptimized: "I use technology that automatically flags conflicts and inconsistencies across documents"
    },

    // Q5: Document Review Thoroughness (10 points)
    document_review_thoroughness: {
        weight: 10,
        scores: {
            "100% - I read every page of every document in every transaction": 10,
            "75-99% - I read most documents thoroughly with rare exceptions": 8,
            "50-74% - I read critical sections and skim the rest": 5,
            "Under 50% - I focus on key points and action items": 2
        },
        category: "process_efficiency",
        aiOptimized: "100% - I read every page of every document in every transaction"
    },

    // Q6: Broker/TC Oversight (10 points)
    broker_oversight: {
        weight: 10,
        scores: {
            "Yes, every document gets reviewed for errors and compliance": 10,
            "Only on complex transactions or deals above a certain value": 6,
            "Occasionally or on a random sampling basis": 3,
            "No, I'm responsible for reviewing my own transactions": 1
        },
        category: "risk_management",
        aiOptimized: "Yes, every document gets reviewed for errors and compliance"
    },

    // Q7: Communicating Potential Issues (10 points)
    issue_communication: {
        weight: 10,
        scores: {
            "I proactively identify and explain potential issues in clear terms before they become problems": 10,
            "I communicate issues when they're officially brought to my attention by other parties": 6,
            "I mention them if they seem significant enough to affect the transaction": 4,
            "I handle most issues behind the scenes to avoid worrying clients unnecessarily": 2
        },
        category: "client_experience",
        aiOptimized: "I proactively identify and explain potential issues in clear terms before they become problems"
    },

    // Q8: Technology & Competitive Advantage (10 points)
    technology_advantage: {
        weight: 10,
        scores: {
            "AI-powered transaction intelligence that provides 24/7 client access and proactive alerts": 10,
            "A robust CRM system with automated email updates and reminders": 7,
            "Standard MLS and transaction management software that most agents use": 4,
            "I differentiate through personal service and responsiveness, not technology": 3
        },
        category: "process_efficiency",
        aiOptimized: "AI-powered transaction intelligence that provides 24/7 client access and proactive alerts"
    },

    // Q9: Client Retention & Referrals (10 points)
    client_retention: {
        weight: 10,
        scores: {
            "75-100% - Most of my business is repeat and referral based": 10,
            "50-74% - About half of my business comes from past clients": 7,
            "25-49% - I get some repeat business but mostly work with new clients": 4,
            "Under 25% - I'm primarily working with first-time clients": 2
        },
        category: "client_experience",
        aiOptimized: "75-100% - Most of my business is repeat and referral based"
    },

    // Q10: Transaction Failures & Liability (10 points)
    transaction_failures: {
        weight: 10,
        scores: {
            "No - I've never had a deal fall through due to missed deadlines or had an E&O claim": 10,
            "I've had deals delayed or stressed due to timeline confusion, but nothing catastrophic": 6,
            "I've lost at least one deal due to missed contingency deadlines or contract issues": 3,
            "I've had an E&O claim or near-miss related to documentation or deadline errors": 0
        },
        category: "risk_management",
        aiOptimized: "No - I've never had a deal fall through due to missed deadlines or had an E&O claim"
    }
};

/**
 * Calculate total score and breakdown
 * @param {Object} responses - User responses object
 * @returns {Object} Scoring results
 */
function calculateScore(responses) {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const categoryScores = {
        process_efficiency: { score: 0, max: 0 },
        risk_management: { score: 0, max: 0 },
        client_experience: { score: 0, max: 0 }
    };
    const questionResults = [];

    // Calculate scores
    for (const [questionId, rule] of Object.entries(scoringRules)) {
        const userResponse = responses[questionId];
        const score = rule.scores[userResponse] || 0;
        const weight = rule.weight;

        totalScore += score;
        maxPossibleScore += weight;

        // Add to category totals
        categoryScores[rule.category].score += score;
        categoryScores[rule.category].max += weight;

        questionResults.push({
            questionId,
            response: userResponse,
            score,
            maxScore: weight,
            aiOptimized: rule.aiOptimized,
            matchesAI: userResponse === rule.aiOptimized
        });
    }

    // Determine performance profile and risk level
    const percentage = (totalScore / maxPossibleScore) * 100;
    let performanceProfile, riskProfile, profileSummary, percentileRank;

    if (percentage >= 85) {
        performanceProfile = "Elite Agent";
        riskProfile = "LOW";
        profileSummary = "You operate at the highest industry standard with exceptional systems, communication, and client service. You're in the top 10% of agents nationally.";
        percentileRank = "Top 10%";
    } else if (percentage >= 70) {
        performanceProfile = "High Performer";
        riskProfile = "MODERATE";
        profileSummary = "You have strong professional fundamentals with good systems and client communication. You're in the top 25% nationally, with clear opportunities for optimization.";
        percentileRank = "Top 25%";
    } else if (percentage >= 50) {
        performanceProfile = "Moderate Risk";
        riskProfile = "HIGH";
        profileSummary = "You're performing at the national average with significant areas for improvement. Better systems and technology could dramatically improve your efficiency and client satisfaction.";
        percentileRank = "Average (50th percentile)";
    } else {
        performanceProfile = "High Risk";
        riskProfile = "CRITICAL";
        profileSummary = "Your practice has substantial gaps in systems, communication, and risk management. Immediate improvements are needed to protect your business and provide better client service.";
        percentileRank = "Below Average";
    }

    // AI optimization gap
    const aiOptimizedScore = 100; // Perfect AI-optimized score
    const optimizationGap = aiOptimizedScore - totalScore;
    const aiMatchCount = questionResults.filter(r => r.matchesAI).length;

    // Identify gaps (questions scoring 50% or less of max)
    const gaps = questionResults.filter(q => (q.score / q.maxScore) <= 0.5);

    return {
        totalScore,
        maxPossibleScore,
        percentage: Math.round(percentage),
        performanceProfile,
        riskProfile,
        profileSummary,
        percentileRank,
        categoryBreakdown: {
            processEfficiency: {
                score: categoryScores.process_efficiency.score,
                max: categoryScores.process_efficiency.max,
                percentage: categoryScores.process_efficiency.max > 0 ?
                    Math.round((categoryScores.process_efficiency.score / categoryScores.process_efficiency.max) * 100) : 0
            },
            riskManagement: {
                score: categoryScores.risk_management.score,
                max: categoryScores.risk_management.max,
                percentage: categoryScores.risk_management.max > 0 ?
                    Math.round((categoryScores.risk_management.score / categoryScores.risk_management.max) * 100) : 0
            },
            clientExperience: {
                score: categoryScores.client_experience.score,
                max: categoryScores.client_experience.max,
                percentage: categoryScores.client_experience.max > 0 ?
                    Math.round((categoryScores.client_experience.score / categoryScores.client_experience.max) * 100) : 0
            }
        },
        aiComparison: {
            aiOptimizedScore,
            yourScore: totalScore,
            gap: optimizationGap,
            matchedAnswers: aiMatchCount,
            totalQuestions: questionResults.length,
            aiAlignmentPercentage: Math.round((aiMatchCount / questionResults.length) * 100)
        },
        gaps,
        questionResults
    };
}

/**
 * Calculate potential score with ContRE platform
 * ContRE features would enable near-perfect scores across all categories
 * @param {Object} currentScoring - Current score object from calculateScore()
 * @returns {Object} Score comparison with ContRE
 */
function calculateScoreWithContre(currentScoring) {
    // With ContRE, agents would achieve near-perfect scores because:
    // - AI doc analysis = max points on process efficiency
    // - Automated deadline tracking = max points on risk management
    // - 24/7 chatbot = max points on client experience

    const contreScores = {
        processEfficiency: {
            score: 29, // Out of 30 (near-perfect, accounting for human factors)
            max: 30,
            percentage: 97,
            reasoning: "ContRE's AI document analysis eliminates hours of manual review and provides instant summaries with risk flagging"
        },
        riskManagement: {
            score: 30, // Out of 30 (perfect - automated systems)
            max: 30,
            percentage: 100,
            reasoning: "Automated deadline extraction + AI risk alerts + logged client interactions eliminate manual tracking errors and provide liability protection"
        },
        clientExperience: {
            score: 39, // Out of 40 (near-perfect with chatbot)
            max: 40,
            percentage: 98,
            reasoning: "Shareable 24/7 chatbot gives clients instant answers to transaction-specific questions, dramatically improving engagement and satisfaction"
        }
    };

    const contreTotalScore = 93; // Out of 100 (conservative, accounting for adoption/human factors)
    const currentTotalScore = currentScoring.totalScore;
    const improvement = contreTotalScore - currentTotalScore;

    return {
        current: {
            totalScore: currentTotalScore,
            maxScore: currentScoring.maxPossibleScore,
            percentage: currentScoring.percentage,
            categoryBreakdown: currentScoring.categoryBreakdown
        },
        withContre: {
            totalScore: contreTotalScore,
            maxScore: 100,
            percentage: 93,
            categoryBreakdown: contreScores
        },
        improvement: {
            totalPoints: improvement,
            percentageIncrease: currentTotalScore > 0 ? Math.round((improvement / currentTotalScore) * 100) : 0,
            categoryImprovements: [
                {
                    category: "Process Efficiency",
                    currentScore: currentScoring.categoryBreakdown.processEfficiency.score,
                    currentPercentage: currentScoring.categoryBreakdown.processEfficiency.percentage,
                    currentMax: currentScoring.categoryBreakdown.processEfficiency.max,
                    withContreScore: contreScores.processEfficiency.score,
                    withContrePercentage: contreScores.processEfficiency.percentage,
                    withContreMax: contreScores.processEfficiency.max,
                    pointGain: contreScores.processEfficiency.score - currentScoring.categoryBreakdown.processEfficiency.score,
                    percentageGain: contreScores.processEfficiency.percentage - currentScoring.categoryBreakdown.processEfficiency.percentage,
                    reasoning: contreScores.processEfficiency.reasoning,
                    specificSolutions: [
                        "AI reads 50-page HOAs/title reports → generates 1-page summary with issue highlights in under 5 minutes",
                        "Upload any document (contract, disclosure, HOA) and get instant AI analysis of risks and key points",
                        "Eliminate 2-3 hours of manual document review per transaction"
                    ]
                },
                {
                    category: "Risk Management",
                    currentScore: currentScoring.categoryBreakdown.riskManagement.score,
                    currentPercentage: currentScoring.categoryBreakdown.riskManagement.percentage,
                    currentMax: currentScoring.categoryBreakdown.riskManagement.max,
                    withContreScore: contreScores.riskManagement.score,
                    withContrePercentage: contreScores.riskManagement.percentage,
                    withContreMax: contreScores.riskManagement.max,
                    pointGain: contreScores.riskManagement.score - currentScoring.categoryBreakdown.riskManagement.score,
                    percentageGain: contreScores.riskManagement.percentage - currentScoring.categoryBreakdown.riskManagement.percentage,
                    reasoning: contreScores.riskManagement.reasoning,
                    specificSolutions: [
                        "Automated deadline extraction from contracts with customizable alert windows",
                        "AI flags potential contract issues and liability risks before they escalate",
                        "Logged client Q&A interactions provide documentation protection for E&O claims",
                        "Never miss a deadline or contingency date again"
                    ]
                },
                {
                    category: "Client Experience",
                    currentScore: currentScoring.categoryBreakdown.clientExperience.score,
                    currentPercentage: currentScoring.categoryBreakdown.clientExperience.percentage,
                    currentMax: currentScoring.categoryBreakdown.clientExperience.max,
                    withContreScore: contreScores.clientExperience.score,
                    withContrePercentage: contreScores.clientExperience.percentage,
                    withContreMax: contreScores.clientExperience.max,
                    pointGain: contreScores.clientExperience.score - currentScoring.categoryBreakdown.clientExperience.score,
                    percentageGain: contreScores.clientExperience.percentage - currentScoring.categoryBreakdown.clientExperience.percentage,
                    reasoning: contreScores.clientExperience.reasoning,
                    specificSolutions: [
                        "Shareable chatbot gives clients 24/7 access to transaction-specific answers (no login required)",
                        "AI-generated document summaries help clients understand complex paperwork",
                        "All client interactions automatically logged for your records and liability protection",
                        "Clients feel more informed and confident throughout the transaction"
                    ]
                }
            ]
        },
        headline: "ContRE could address nearly all identified gaps instantly",
        keyMessage: "This isn't about changing your workflow. ContRE works with your existing systems (SkySlope/LoneWolf/DotLoop) and gives you an AI assistant that saves hours per transaction while protecting you from risk."
    };
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateScore, calculateScoreWithContre, scoringRules };
}
