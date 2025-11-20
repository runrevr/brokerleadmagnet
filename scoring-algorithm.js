/**
 * Transaction Failure Risk Assessment Scoring Algorithm
 *
 * New Philosophy: Every question should either:
 * - Quantify actual losses happening RIGHT NOW
 * - Expose a blind spot they didn't know they had
 * - Make them realize "oh shit, we can't actually do that"
 *
 * Total: 512 points
 */

const scoringRules = {
    // Section 2: Deal Failure Reality (45 points max)
    deals_fallen_through: {
        weight: 20,
        scores: {
            "We don't track this": 0,
            "0 deals": 5,
            "1-3 deals": 20,
            "4-8 deals": 15,
            "9-15 deals": 10,
            "15+ deals": 5
        },
        category: "deal_failure_reality",
        aiOptimized: "1-3 deals"
    },

    failed_deal_causes: {
        weight: 20,
        scores: {
            "Don't know/Can't say": 0,
            "Less than 25%": 20,
            "25-50%": 15,
            "50-75%": 10,
            "75-100%": 5
        },
        category: "deal_failure_reality",
        aiOptimized: "Less than 25%"
    },

    lost_commission_value: {
        weight: 25,
        scores: {
            "Haven't calculated": 0,
            "Under $50K": 25,
            "$50K-$150K": 20,
            "$150K-$300K": 15,
            "$300K-$500K": 10,
            "Over $500K": 5
        },
        category: "deal_failure_reality",
        aiOptimized: "Under $50K"
    },

    // Section 3: Deadline Visibility Gap (100 points max)
    inspection_deadlines_visibility: {
        weight: 35,
        scores: {
            "Can tell you the exact number": 35,
            "Could find out in under 5 minutes": 25,
            "Would need to ask TCs or agents": 15,
            "Would take 30+ minutes to compile": 5,
            "Don't know and can't easily find out": 0
        },
        category: "deadline_visibility",
        aiOptimized: "Can tell you the exact number"
    },

    at_risk_deals: {
        weight: 35,
        scores: {
            "Can tell you exactly which deals and why": 35,
            "Could find out with some calls/research": 20,
            "Would need to ask each agent": 10,
            "No way to know until problems surface": 0
        },
        category: "deadline_visibility",
        aiOptimized: "Can tell you exactly which deals and why"
    },

    addendum_deadline_handling: {
        weight: 30,
        scores: {
            "System automatically recalculates everything": 30,
            "TC manually updates all dependent dates": 20,
            "Agent is responsible for catching it": 10,
            "We hope everyone notices and adjusts": 5,
            "Usually gets missed until there's a problem": 0
        },
        category: "deadline_visibility",
        aiOptimized: "System automatically recalculates everything"
    },

    // Section 4: Document Intelligence (105 points max)
    date_extraction_time: {
        weight: 35,
        scores: {
            "Extracted automatically in under 30 seconds": 35,
            "TC enters manually within same day": 20,
            "Agent enters when they get around to it": 10,
            "We don't systematically extract all dates": 5,
            "What tracking system?": 0
        },
        category: "document_intelligence",
        aiOptimized: "Extracted automatically in under 30 seconds"
    },

    inspection_deadline_check: {
        weight: 35,
        scores: {
            "System compares to our standards and flags it": 35,
            "Experienced TC/broker notices during review": 20,
            "We realize it during inspection period when time is tight": 10,
            "We don't proactively check this": 0
        },
        category: "document_intelligence",
        aiOptimized: "System compares to our standards and flags it"
    },

    document_conflict_detection: {
        weight: 35,
        scores: {
            "AI cross-references all transaction documents automatically": 35,
            "TC manually reviews for conflicts": 20,
            "Hoping agent notices during their review": 10,
            "Usually only catch it if client asks or title finds it": 5,
            "We've had deals fall apart from this": 0
        },
        category: "document_intelligence",
        aiOptimized: "AI cross-references all transaction documents automatically"
    },

    // Section 5: Agent Knowledge & Consistency (100 points max)
    after_hours_policy_access: {
        weight: 35,
        scores: {
            "Yes, AI assistant trained on our docs, available 24/7": 35,
            "Yes, searchable knowledge base": 25,
            "They'd text/email someone and wait for response": 15,
            "They'd have to wait until Monday to ask": 5,
            "They'd probably just guess based on what they remember": 0
        },
        category: "agent_knowledge",
        aiOptimized: "Yes, AI assistant trained on our docs, available 24/7"
    },

    agent_consistency: {
        weight: 30,
        scores: {
            "One consistent way - we have documented standards": 30,
            "Mostly consistent with minor variations": 20,
            "Each experienced agent has their own approach": 10,
            "New agents copy whoever trained them": 5,
            "Wide variation - \"every agent does it differently\"": 0
        },
        category: "agent_knowledge",
        aiOptimized: "One consistent way - we have documented standards"
    },

    policy_update_compliance: {
        weight: 35,
        scores: {
            "System requires acknowledgment, tracks who's read it, tests understanding": 35,
            "Email to all agents with tracking": 20,
            "Announce in meeting, hope they remember": 10,
            "Post to shared drive, assume they'll see it": 5,
            "Tell people informally as it comes up": 0
        },
        category: "agent_knowledge",
        aiOptimized: "System requires acknowledgment, tracks who's read it, tests understanding"
    },

    // Section 6: Client Experience & Liability (95 points max)
    after_hours_client_support: {
        weight: 35,
        scores: {
            "AI chatbot with their specific transaction documents": 35,
            "Agent responds to texts/calls when available": 20,
            "They wait until Monday morning": 10,
            "They Google it and might get wrong answers": 5,
            "They get anxious and call multiple people": 0
        },
        category: "client_experience_liability",
        aiOptimized: "AI chatbot with their specific transaction documents"
    },

    client_document_understanding: {
        weight: 35,
        scores: {
            "90%+ thanks to AI summaries and chatbot": 35,
            "75%+ through good agent explanation": 25,
            "50-75% - depends on agent and client": 15,
            "25-50% - most just trust their agent": 8,
            "Under 25% - they mostly just sign": 0
        },
        category: "client_experience_liability",
        aiOptimized: "90%+ thanks to AI summaries and chatbot"
    },

    closing_delays: {
        weight: 35,
        scores: {
            "Never - we catch everything early": 35,
            "Rarely - maybe 1-2 times per year": 25,
            "Occasionally - 3-5 times per year": 15,
            "Regularly - 6-10 times per year": 8,
            "Frequently - happens all the time": 0
        },
        category: "client_experience_liability",
        aiOptimized: "Never - we catch everything early"
    },

    // Section 7: E&O Risk & Protection (67 points max)
    eo_claims_history: {
        weight: 34,
        scores: {
            "0 claims, 0 near-misses": 34,
            "0 claims, 1-2 near-misses": 25,
            "0 claims, 3+ near-misses": 15,
            "1 claim": 8,
            "2+ claims": 0
        },
        category: "eo_risk_protection",
        aiOptimized: "0 claims, 0 near-misses"
    },

    liability_risk_awareness: {
        weight: 33,
        scores: {
            "Yes - system scores risk and flags issues automatically": 33,
            "Somewhat - experienced broker/TC flags concerning deals": 20,
            "Not really - we treat all deals the same": 10,
            "No - we only know when something goes wrong": 0
        },
        category: "eo_risk_protection",
        aiOptimized: "Yes - system scores risk and flags issues automatically"
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
        deal_failure_reality: { score: 0, max: 0 },
        deadline_visibility: { score: 0, max: 0 },
        document_intelligence: { score: 0, max: 0 },
        agent_knowledge: { score: 0, max: 0 },
        client_experience_liability: { score: 0, max: 0 },
        eo_risk_protection: { score: 0, max: 0 }
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

    // Determine risk profile based on new scoring framework
    const percentage = (totalScore / maxPossibleScore) * 100;
    let riskProfile, profileSummary, percentileRank, estimatedLosses;

    if (percentage >= 88) {
        riskProfile = "Transaction Intelligence Leader";
        profileSummary = "You're operating at the highest level. You have visibility, automation, and proactive systems that prevent failures before they happen. Your risk exposure is minimal.";
        percentileRank = "Top 5%";
        estimatedLosses = "Under $50K";
    } else if (percentage >= 71) {
        riskProfile = "Moderate Risk with Gaps";
        profileSummary = "You have some good systems, but significant blind spots exist. You're probably losing $75-150K annually to preventable failures. Your manual processes are creating bottlenecks and risk.";
        percentileRank = "Top 25%";
        estimatedLosses = "$75K-$150K";
    } else if (percentage >= 53) {
        riskProfile = "High Risk - Flying Blind";
        profileSummary = "Major visibility gaps. You don't know what you don't know. You're likely losing $150-300K+ annually and operating reactively rather than proactively. One bad quarter could be catastrophic.";
        percentileRank = "Top 50%";
        estimatedLosses = "$150K-$300K+";
    } else if (percentage >= 35) {
        riskProfile = "Critical Risk";
        profileSummary = "Your brokerage is in danger. Deal failures are common, agent inconsistency is rampant, and you have little oversight until problems explode. Immediate intervention needed.";
        percentileRank = "Bottom 50%";
        estimatedLosses = "$300K+";
    } else {
        riskProfile = "Existential Threat";
        profileSummary = "You are one major E&O claim away from serious financial consequences. The lack of transaction intelligence and deadline management puts every single deal at risk.";
        percentileRank = "Bottom 10%";
        estimatedLosses = "Significant financial exposure";
    }

    // AI optimization gap
    const aiOptimizedScore = maxPossibleScore;
    const optimizationGap = aiOptimizedScore - totalScore;
    const aiMatchCount = questionResults.filter(r => r.matchesAI).length;

    return {
        totalScore,
        maxPossibleScore,
        percentage: Math.round(percentage),
        riskProfile,
        profileSummary,
        percentileRank,
        estimatedLosses,
        categoryBreakdown: {
            dealFailureReality: {
                score: categoryScores.deal_failure_reality.score,
                max: categoryScores.deal_failure_reality.max,
                percentage: Math.round((categoryScores.deal_failure_reality.score / categoryScores.deal_failure_reality.max) * 100)
            },
            deadlineVisibility: {
                score: categoryScores.deadline_visibility.score,
                max: categoryScores.deadline_visibility.max,
                percentage: Math.round((categoryScores.deadline_visibility.score / categoryScores.deadline_visibility.max) * 100)
            },
            documentIntelligence: {
                score: categoryScores.document_intelligence.score,
                max: categoryScores.document_intelligence.max,
                percentage: Math.round((categoryScores.document_intelligence.score / categoryScores.document_intelligence.max) * 100)
            },
            agentKnowledge: {
                score: categoryScores.agent_knowledge.score,
                max: categoryScores.agent_knowledge.max,
                percentage: Math.round((categoryScores.agent_knowledge.score / categoryScores.agent_knowledge.max) * 100)
            },
            clientExperienceLiability: {
                score: categoryScores.client_experience_liability.score,
                max: categoryScores.client_experience_liability.max,
                percentage: Math.round((categoryScores.client_experience_liability.score / categoryScores.client_experience_liability.max) * 100)
            },
            eoRiskProtection: {
                score: categoryScores.eo_risk_protection.score,
                max: categoryScores.eo_risk_protection.max,
                percentage: Math.round((categoryScores.eo_risk_protection.score / categoryScores.eo_risk_protection.max) * 100)
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
        questionResults
    };
}

/**
 * Calculate potential score with ContRE platform
 * @param {Object} currentScoring - Current score object from calculateScore()
 * @returns {Object} Score comparison with ContRE
 */
function calculateScoreWithContre(currentScoring) {
    // With ContRE, brokerage would achieve near-perfect scores
    const contreScores = {
        dealFailureReality: {
            score: 40, // Out of 45
            max: 45,
            percentage: 89,
            reasoning: "ContRE tracking and analytics help identify patterns and prevent deal failures before they happen"
        },
        deadlineVisibility: {
            score: 100, // Out of 100
            max: 100,
            percentage: 100,
            reasoning: "Automated deadline extraction and real-time visibility across all transactions"
        },
        documentIntelligence: {
            score: 105, // Out of 105
            max: 105,
            percentage: 100,
            reasoning: "AI cross-references all documents, extracts dates instantly, and flags conflicts automatically"
        },
        agentKnowledge: {
            score: 95, // Out of 100
            max: 100,
            percentage: 95,
            reasoning: "24/7 AI assistant with brokerage policies and compliance tracking"
        },
        clientExperienceLiability: {
            score: 90, // Out of 95
            max: 95,
            percentage: 95,
            reasoning: "AI chatbot provides 24/7 client support with document summaries and logged interactions"
        },
        eoRiskProtection: {
            score: 65, // Out of 67
            max: 67,
            percentage: 97,
            reasoning: "Automated risk scoring and documented client interactions protect against E&O claims"
        }
    };

    const contreTotalScore = 495; // Out of 512
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
            maxScore: 512,
            percentage: 97,
            categoryBreakdown: contreScores
        },
        improvement: {
            totalPoints: improvement,
            percentageIncrease: Math.round((improvement / currentTotalScore) * 100),
            categoryImprovements: [
                {
                    category: "Deal Failure Reality",
                    currentScore: currentScoring.categoryBreakdown.dealFailureReality.score,
                    currentMax: currentScoring.categoryBreakdown.dealFailureReality.max,
                    withContreScore: contreScores.dealFailureReality.score,
                    withContreMax: contreScores.dealFailureReality.max,
                    pointGain: contreScores.dealFailureReality.score - currentScoring.categoryBreakdown.dealFailureReality.score,
                    reasoning: contreScores.dealFailureReality.reasoning,
                    specificSolutions: [
                        "Transaction analytics identify failure patterns before they impact deals",
                        "Proactive alerts on at-risk transactions based on historical data",
                        "Root cause analysis on failed deals to prevent recurrence"
                    ]
                },
                {
                    category: "Deadline Visibility",
                    currentScore: currentScoring.categoryBreakdown.deadlineVisibility.score,
                    currentMax: currentScoring.categoryBreakdown.deadlineVisibility.max,
                    withContreScore: contreScores.deadlineVisibility.score,
                    withContreMax: contreScores.deadlineVisibility.max,
                    pointGain: contreScores.deadlineVisibility.score - currentScoring.categoryBreakdown.deadlineVisibility.score,
                    reasoning: contreScores.deadlineVisibility.reasoning,
                    specificSolutions: [
                        "Real-time dashboard shows all deadlines across entire brokerage",
                        "Automatic recalculation when closing dates change",
                        "Custom alert windows (X days before each deadline type)"
                    ]
                },
                {
                    category: "Document Intelligence",
                    currentScore: currentScoring.categoryBreakdown.documentIntelligence.score,
                    currentMax: currentScoring.categoryBreakdown.documentIntelligence.max,
                    withContreScore: contreScores.documentIntelligence.score,
                    withContreMax: contreScores.documentIntelligence.max,
                    pointGain: contreScores.documentIntelligence.score - currentScoring.categoryBreakdown.documentIntelligence.score,
                    reasoning: contreScores.documentIntelligence.reasoning,
                    specificSolutions: [
                        "AI extracts all critical dates in under 30 seconds",
                        "Cross-references documents for conflicts (HOA vs. contract)",
                        "Flags inspection deadlines that are too short for market"
                    ]
                },
                {
                    category: "Agent Knowledge",
                    currentScore: currentScoring.categoryBreakdown.agentKnowledge.score,
                    currentMax: currentScoring.categoryBreakdown.agentKnowledge.max,
                    withContreScore: contreScores.agentKnowledge.score,
                    withContreMax: contreScores.agentKnowledge.max,
                    pointGain: contreScores.agentKnowledge.score - currentScoring.categoryBreakdown.agentKnowledge.score,
                    reasoning: contreScores.agentKnowledge.reasoning,
                    specificSolutions: [
                        "24/7 AI assistant trained on brokerage policies",
                        "Policy acknowledgment tracking and comprehension testing",
                        "Consistent answers reduce agent variation"
                    ]
                },
                {
                    category: "Client Experience & Liability",
                    currentScore: currentScoring.categoryBreakdown.clientExperienceLiability.score,
                    currentMax: currentScoring.categoryBreakdown.clientExperienceLiability.max,
                    withContreScore: contreScores.clientExperienceLiability.score,
                    withContreMax: contreScores.clientExperienceLiability.max,
                    pointGain: contreScores.clientExperienceLiability.score - currentScoring.categoryBreakdown.clientExperienceLiability.score,
                    reasoning: contreScores.clientExperienceLiability.reasoning,
                    specificSolutions: [
                        "Shareable chatbot gives clients 24/7 access to their transaction",
                        "AI-generated document summaries improve understanding",
                        "All interactions logged for liability protection"
                    ]
                },
                {
                    category: "E&O Risk Protection",
                    currentScore: currentScoring.categoryBreakdown.eoRiskProtection.score,
                    currentMax: currentScoring.categoryBreakdown.eoRiskProtection.max,
                    withContreScore: contreScores.eoRiskProtection.score,
                    withContreMax: contreScores.eoRiskProtection.max,
                    pointGain: contreScores.eoRiskProtection.score - currentScoring.categoryBreakdown.eoRiskProtection.score,
                    reasoning: contreScores.eoRiskProtection.reasoning,
                    specificSolutions: [
                        "Automated risk scoring identifies high-liability transactions",
                        "Documented Q&A interactions provide E&O protection",
                        "Proactive issue flagging prevents claims before they happen"
                    ]
                }
            ]
        },
        headline: "ContRE would address nearly all identified gaps instantly",
        keyMessage: "This isn't a 60-day roadmap requiring operational overhaul. ContRE integrates with your existing transaction management system (SkySlope/LoneWolf/Dotloop) and works from day one as an intelligence layer."
    };
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateScore, calculateScoreWithContre, scoringRules };
}
