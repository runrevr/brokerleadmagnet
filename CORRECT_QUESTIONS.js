/**
 * Transaction Failure Risk Assessment Questions
 * New Philosophy: Every question should either:
 * - Quantify actual losses happening RIGHT NOW
 * - Expose a blind spot they didn't know they had
 * - Make them realize "oh shit, we can't actually do that"
 *
 * TOTAL POSSIBLE: 567 points
 */

const assessmentQuestions = {
    companyInfo: {
        title: "Company Profile",
        questions: [
            {
                id: "company_name",
                label: "Brokerage Name",
                type: "text",
                required: true
            },
            {
                id: "agent_count",
                label: "Number of Agents",
                type: "select",
                options: ["1-10", "11-25", "26-50", "51-100", "100+"],
                required: true
            },
            {
                id: "monthly_deals",
                label: "Average Monthly Transactions",
                type: "select",
                options: ["1-10", "11-20", "21-50", "51-100", "101-200", "200+"],
                required: true
            },
            {
                id: "location",
                label: "Primary Market/City",
                type: "text",
                required: true
            },
            {
                id: "transaction_system",
                label: "What transaction management system do you use?",
                type: "select",
                options: ["SkySlope", "LoneWolf", "Dotloop", "Other", "None"],
                required: true
            }
        ]
    },
    dealFailureReality: {
        title: "Deal Failure Reality",
        questions: [
            {
                id: "deals_fallen_through",
                label: "In the last 12 months, how many deals fell through AFTER being under contract?",
                type: "select",
                options: [
                    "We don't track this",
                    "0 deals",
                    "1-3 deals",
                    "4-8 deals",
                    "9-15 deals",
                    "15+ deals"
                ],
                scoring: {
                    "We don't track this": 0,
                    "0 deals": 5,
                    "1-3 deals": 20,
                    "4-8 deals": 15,
                    "9-15 deals": 10,
                    "15+ deals": 5
                }
            },
            {
                id: "failed_deal_causes",
                label: "Of those failed deals, what percentage were due to missed deadlines, inspection issues, or document problems?",
                type: "select",
                options: [
                    "Don't know/Can't say",
                    "Less than 25%",
                    "25-50%",
                    "50-75%",
                    "75-100%"
                ],
                scoring: {
                    "Don't know/Can't say": 0,
                    "Less than 25%": 20,
                    "25-50%": 15,
                    "50-75%": 10,
                    "75-100%": 5
                }
            },
            {
                id: "lost_commission_value",
                label: "Based on your average commission per deal, what's the approximate dollar value of lost commissions from failed deals in the last 12 months?",
                type: "select",
                options: [
                    "Haven't calculated",
                    "Under $50K",
                    "$50K-$150K",
                    "$150K-$300K",
                    "$300K-$500K",
                    "Over $500K"
                ],
                scoring: {
                    "Haven't calculated": 0,
                    "Under $50K": 25,
                    "$50K-$150K": 20,
                    "$150K-$300K": 15,
                    "$300K-$500K": 10,
                    "Over $500K": 5
                }
            }
        ]
    },
    deadlineVisibility: {
        title: "Deadline Visibility Gap",
        questions: [
            {
                id: "inspection_deadlines_visibility",
                label: "Right now, without looking anything up, how many of your agents have inspection deadlines in the next 7 days?",
                type: "select",
                options: [
                    "Can tell you the exact number",
                    "Could find out in under 5 minutes",
                    "Would need to ask TCs or agents",
                    "Would take 30+ minutes to compile",
                    "Don't know and can't easily find out"
                ],
                scoring: {
                    "Can tell you the exact number": 35,
                    "Could find out in under 5 minutes": 25,
                    "Would need to ask TCs or agents": 15,
                    "Would take 30+ minutes to compile": 5,
                    "Don't know and can't easily find out": 0
                }
            },
            {
                id: "at_risk_deals",
                label: "How many deals closing THIS MONTH could be at risk due to financing delays or appraisal issues?",
                type: "select",
                options: [
                    "Can tell you exactly which deals and why",
                    "Could find out with some calls/research",
                    "Would need to ask each agent",
                    "No way to know until problems surface"
                ],
                scoring: {
                    "Can tell you exactly which deals and why": 35,
                    "Could find out with some calls/research": 20,
                    "Would need to ask each agent": 10,
                    "No way to know until problems surface": 0
                }
            },
            {
                id: "addendum_deadline_handling",
                label: "When an addendum changes a closing date, what happens to all the related deadlines (inspection, financing, appraisal)?",
                type: "select",
                options: [
                    "System automatically recalculates everything",
                    "TC manually updates all dependent dates",
                    "Agent is responsible for catching it",
                    "We hope everyone notices and adjusts",
                    "Usually gets missed until there's a problem"
                ],
                scoring: {
                    "System automatically recalculates everything": 30,
                    "TC manually updates all dependent dates": 20,
                    "Agent is responsible for catching it": 10,
                    "We hope everyone notices and adjusts": 5,
                    "Usually gets missed until there's a problem": 0
                }
            }
        ]
    },
    documentIntelligence: {
        title: "Document Intelligence",
        questions: [
            {
                id: "date_extraction_time",
                label: "When a TC uploads a purchase agreement, how long until all critical dates are in your tracking system?",
                type: "select",
                options: [
                    "Extracted automatically in under 30 seconds",
                    "TC enters manually within same day",
                    "Agent enters when they get around to it",
                    "We don't systematically extract all dates",
                    "What tracking system?"
                ],
                scoring: {
                    "Extracted automatically in under 30 seconds": 35,
                    "TC enters manually within same day": 20,
                    "Agent enters when they get around to it": 10,
                    "We don't systematically extract all dates": 5,
                    "What tracking system?": 0
                }
            },
            {
                id: "inspection_deadline_check",
                label: "How do you know if an inspection deadline is too short for your market?",
                type: "select",
                options: [
                    "System compares to our standards and flags it",
                    "Experienced TC/broker notices during review",
                    "We realize it during inspection period when time is tight",
                    "We don't proactively check this"
                ],
                scoring: {
                    "System compares to our standards and flags it": 35,
                    "Experienced TC/broker notices during review": 20,
                    "We realize it during inspection period when time is tight": 10,
                    "We don't proactively check this": 0
                }
            },
            {
                id: "document_conflict_detection",
                label: "When HOA documents contradict something in the purchase agreement (e.g., rental restrictions), how do you catch it?",
                type: "select",
                options: [
                    "AI cross-references all transaction documents automatically",
                    "TC manually reviews for conflicts",
                    "Hoping agent notices during their review",
                    "Usually only catch it if client asks or title finds it",
                    "We've had deals fall apart from this"
                ],
                scoring: {
                    "AI cross-references all transaction documents automatically": 35,
                    "TC manually reviews for conflicts": 20,
                    "Hoping agent notices during their review": 10,
                    "Usually only catch it if client asks or title finds it": 5,
                    "We've had deals fall apart from this": 0
                }
            }
        ]
    },
    agentKnowledge: {
        title: "Agent Knowledge & Consistency",
        questions: [
            {
                id: "after_hours_policy_access",
                label: "At 11 PM on a Saturday, can your agents instantly find your brokerage's policy on dual agency disclosure / commission splits / required forms?",
                type: "select",
                options: [
                    "Yes, AI assistant trained on our docs, available 24/7",
                    "Yes, searchable knowledge base",
                    "They'd text/email someone and wait for response",
                    "They'd have to wait until Monday to ask",
                    "They'd probably just guess based on what they remember"
                ],
                scoring: {
                    "Yes, AI assistant trained on our docs, available 24/7": 35,
                    "Yes, searchable knowledge base": 25,
                    "They'd text/email someone and wait for response": 15,
                    "They'd have to wait until Monday to ask": 5,
                    "They'd probably just guess based on what they remember": 0
                }
            },
            {
                id: "agent_consistency",
                label: "How many different ways do your agents handle the same situation (e.g., writing up dual agency)?",
                type: "select",
                options: [
                    "One consistent way - we have documented standards",
                    "Mostly consistent with minor variations",
                    "Each experienced agent has their own approach",
                    "New agents copy whoever trained them",
                    "Wide variation - \"every agent does it differently\""
                ],
                scoring: {
                    "One consistent way - we have documented standards": 30,
                    "Mostly consistent with minor variations": 20,
                    "Each experienced agent has their own approach": 10,
                    "New agents copy whoever trained them": 5,
                    "Wide variation - \"every agent does it differently\"": 0
                }
            },
            {
                id: "policy_update_compliance",
                label: "When you update a brokerage policy, how do you ensure compliance?",
                type: "select",
                options: [
                    "System requires acknowledgment, tracks who's read it, tests understanding",
                    "Email to all agents with tracking",
                    "Announce in meeting, hope they remember",
                    "Post to shared drive, assume they'll see it",
                    "Tell people informally as it comes up"
                ],
                scoring: {
                    "System requires acknowledgment, tracks who's read it, tests understanding": 35,
                    "Email to all agents with tracking": 20,
                    "Announce in meeting, hope they remember": 10,
                    "Post to shared drive, assume they'll see it": 5,
                    "Tell people informally as it comes up": 0
                }
            }
        ]
    },
    clientExperienceLiability: {
        title: "Client Experience & Liability",
        questions: [
            {
                id: "after_hours_client_support",
                label: "How do your clients get answers to transaction questions at 10 PM on a Sunday?",
                type: "select",
                options: [
                    "AI chatbot with their specific transaction documents",
                    "Agent responds to texts/calls when available",
                    "They wait until Monday morning",
                    "They Google it and might get wrong answers",
                    "They get anxious and call multiple people"
                ],
                scoring: {
                    "AI chatbot with their specific transaction documents": 35,
                    "Agent responds to texts/calls when available": 20,
                    "They wait until Monday morning": 10,
                    "They Google it and might get wrong answers": 5,
                    "They get anxious and call multiple people": 0
                }
            },
            {
                id: "client_document_understanding",
                label: "What percentage of your clients actually understand what they're signing?",
                type: "select",
                options: [
                    "90%+ thanks to AI summaries and chatbot",
                    "75%+ through good agent explanation",
                    "50-75% - depends on agent and client",
                    "25-50% - most just trust their agent",
                    "Under 25% - they mostly just sign"
                ],
                scoring: {
                    "90%+ thanks to AI summaries and chatbot": 35,
                    "75%+ through good agent explanation": 25,
                    "50-75% - depends on agent and client": 15,
                    "25-50% - most just trust their agent": 8,
                    "Under 25% - they mostly just sign": 0
                }
            },
            {
                id: "closing_delays",
                label: "How often do document/paperwork issues delay your closings?",
                type: "select",
                options: [
                    "Never - we catch everything early",
                    "Rarely - maybe 1-2 times per year",
                    "Occasionally - 3-5 times per year",
                    "Regularly - 6-10 times per year",
                    "Frequently - happens all the time"
                ],
                scoring: {
                    "Never - we catch everything early": 35,
                    "Rarely - maybe 1-2 times per year": 25,
                    "Occasionally - 3-5 times per year": 15,
                    "Regularly - 6-10 times per year": 8,
                    "Frequently - happens all the time": 0
                }
            }
        ]
    },
    eoRiskProtection: {
        title: "E&O Risk & Protection",
        questions: [
            {
                id: "eo_claims_history",
                label: "E&O claims or near-misses in the last 2 years?",
                type: "select",
                options: [
                    "0 claims, 0 near-misses",
                    "0 claims, 1-2 near-misses",
                    "0 claims, 3+ near-misses",
                    "1 claim",
                    "2+ claims"
                ],
                scoring: {
                    "0 claims, 0 near-misses": 34,
                    "0 claims, 1-2 near-misses": 25,
                    "0 claims, 3+ near-misses": 15,
                    "1 claim": 8,
                    "2+ claims": 0
                }
            },
            {
                id: "liability_risk_awareness",
                label: "Do you know which of your current transactions have the highest liability risk?",
                type: "select",
                options: [
                    "Yes - system scores risk and flags issues automatically",
                    "Somewhat - experienced broker/TC flags concerning deals",
                    "Not really - we treat all deals the same",
                    "No - we only know when something goes wrong"
                ],
                scoring: {
                    "Yes - system scores risk and flags issues automatically": 33,
                    "Somewhat - experienced broker/TC flags concerning deals": 20,
                    "Not really - we treat all deals the same": 10,
                    "No - we only know when something goes wrong": 0
                }
            }
        ]
    }
};

/**
 * Scoring Framework (Total 567 points)
 *
 * Section Breakdown:
 * - Deal Failure Reality: 45 points (3 questions)
 * - Deadline Visibility Gap: 100 points (3 questions)
 * - Document Intelligence: 105 points (3 questions)
 * - Agent Knowledge & Consistency: 100 points (3 questions)
 * - Client Experience & Liability: 95 points (3 questions)
 * - E&O Risk & Protection: 67 points (2 questions)
 *
 * Risk Profiles:
 * - 500-567 points (88%+): Transaction Intelligence Leader
 * - 400-499 points (71-87%): Moderate Risk with Gaps
 * - 300-399 points (53-70%): High Risk - Flying Blind
 * - 200-299 points (35-52%): Critical Risk
 * - Under 200 points (<35%): Existential Threat
 */

// Scoring calculation function
const calculateScores = (responses) => {
    let scores = {
        dealFailureReality: 0,
        deadlineVisibility: 0,
        documentIntelligence: 0,
        agentKnowledge: 0,
        clientExperienceLiability: 0,
        eoRiskProtection: 0,
        overall: 0
    };

    // Calculate category scores
    Object.entries(assessmentQuestions).forEach(([category, data]) => {
        if (category !== 'companyInfo') {
            let categoryScore = 0;
            data.questions.forEach(question => {
                if (question.scoring && responses[question.id]) {
                    categoryScore += question.scoring[responses[question.id]] || 0;
                }
            });
            scores[category] = categoryScore;
        }
    });

    // Calculate overall score
    const totalScore = scores.dealFailureReality + scores.deadlineVisibility +
                      scores.documentIntelligence + scores.agentKnowledge +
                      scores.clientExperienceLiability + scores.eoRiskProtection;

    // Total possible: 512 points (45+100+105+100+95+67)
    scores.overall = Math.round((totalScore / 512) * 100);

    // Determine risk level based on new scoring framework
    if (scores.overall >= 88) {
        scores.riskLevel = "LEADER";
        scores.riskDescription = "Transaction Intelligence Leader";
    } else if (scores.overall >= 71) {
        scores.riskLevel = "MODERATE";
        scores.riskDescription = "Moderate Risk with Gaps";
    } else if (scores.overall >= 53) {
        scores.riskLevel = "HIGH";
        scores.riskDescription = "High Risk - Flying Blind";
    } else if (scores.overall >= 35) {
        scores.riskLevel = "CRITICAL";
        scores.riskDescription = "Critical Risk";
    } else {
        scores.riskLevel = "EXISTENTIAL";
        scores.riskDescription = "Existential Threat";
    }

    // Determine percentile
    if (scores.overall >= 88) scores.percentile = "Top 5%";
    else if (scores.overall >= 71) scores.percentile = "Top 25%";
    else if (scores.overall >= 53) scores.percentile = "Top 50%";
    else scores.percentile = "Bottom 50%";

    // Calculate estimated annual losses based on score
    if (scores.overall >= 88) {
        scores.estimatedLosses = "Under $50K";
    } else if (scores.overall >= 71) {
        scores.estimatedLosses = "$75K-$150K";
    } else if (scores.overall >= 53) {
        scores.estimatedLosses = "$150K-$300K+";
    } else if (scores.overall >= 35) {
        scores.estimatedLosses = "$300K+";
    } else {
        scores.estimatedLosses = "Significant financial exposure";
    }

    return scores;
};

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        assessmentQuestions,
        calculateScores
    };
}
