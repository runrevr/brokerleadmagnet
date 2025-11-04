/**
 * Correct Assessment Questions from Broker Questionnaire.pdf
 * This file contains the actual questions to replace in brokerage-intelligence-platform.html
 */

const assessmentQuestions = {
    companyInfo: {
        title: "Company Information",
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
            }
        ]
    },
    transactionOversight: {
        title: "Transaction Oversight Excellence",
        questions: [
            {
                id: "contract_oversight",
                label: "Who is responsible for contract oversight in your brokerage?",
                type: "select",
                options: [
                    "Agent only",
                    "Transaction Coordinator only",
                    "Broker only",
                    "TC + Broker share",
                    "Everyone + AI verification"
                ],
                scoring: {
                    "Agent only": 5,
                    "Transaction Coordinator only": 10,
                    "Broker only": 15,
                    "TC + Broker share": 25,
                    "Everyone + AI verification": 33
                }
            },
            {
                id: "document_review_time",
                label: "How long does it take to effectively review ALL documents in a typical transaction?",
                type: "select",
                options: [
                    "5+ hours",
                    "3-5 hours",
                    "2-3 hours",
                    "1-2 hours",
                    "Under 30 minutes with AI"
                ],
                scoring: {
                    "5+ hours": 5,
                    "3-5 hours": 10,
                    "2-3 hours": 15,
                    "1-2 hours": 25,
                    "Under 30 minutes with AI": 33
                }
            },
            {
                id: "agent_document_reading",
                label: "Are agents expected to read every line of HOAs, title reports, inspection reports? If yes, what percentage actually do it?",
                type: "select",
                options: [
                    "Not expected to",
                    "Expected but <25% do",
                    "Expected but 25-50% do",
                    "Expected but 50-75% do",
                    "Expected and >75% do",
                    "AI reads everything, agents review summaries"
                ],
                scoring: {
                    "Not expected to": 0,
                    "Expected but <25% do": 5,
                    "Expected but 25-50% do": 10,
                    "Expected but 50-75% do": 20,
                    "Expected and >75% do": 28,
                    "AI reads everything, agents review summaries": 34
                }
            }
        ]
    },
    operationalSystems: {
        title: "Operational Systems Maturity",
        questions: [
            {
                id: "deadline_tracking_system",
                label: "Do you have a system to track all transaction deadlines?",
                type: "select",
                options: [
                    "No system - agent responsibility",
                    "Manual calendars/spreadsheets",
                    "Basic transaction software",
                    "Automated deadline tracking",
                    "AI-extracted with smart alerts"
                ],
                scoring: {
                    "No system - agent responsibility": 5,
                    "Manual calendars/spreadsheets": 10,
                    "Basic transaction software": 20,
                    "Automated deadline tracking": 28,
                    "AI-extracted with smart alerts": 33
                }
            },
            {
                id: "missed_deadlines",
                label: "How many transaction deadlines were missed last quarter?",
                type: "select",
                options: [
                    "Not tracked",
                    "10+",
                    "6-10",
                    "3-5",
                    "1-2",
                    "None"
                ],
                scoring: {
                    "Not tracked": 0,
                    "10+": 5,
                    "6-10": 10,
                    "3-5": 18,
                    "1-2": 25,
                    "None": 33
                }
            },
            {
                id: "deal_losses",
                label: "Have you ever lost a deal or made brokerage concessions at closing due to issues identified too late?",
                type: "select",
                options: [
                    "Too often to count",
                    "Frequently (10+ times per year)",
                    "Regularly (6-10 times per year)",
                    "Occasionally (3-5 times per year)",
                    "Rarely (1-2 times per year)",
                    "Never happens"
                ],
                scoring: {
                    "Too often to count": 0,
                    "Frequently (10+ times per year)": 5,
                    "Regularly (6-10 times per year)": 10,
                    "Occasionally (3-5 times per year)": 18,
                    "Rarely (1-2 times per year)": 25,
                    "Never happens": 34
                }
            }
        ]
    },
    knowledgeManagement: {
        title: "Knowledge Management & Training",
        questions: [
            {
                id: "agent_training_frequency",
                label: "How often do you conduct mandatory agent training on forms/contracts?",
                type: "select",
                options: [
                    "Never - agents learn on their own",
                    "Annually",
                    "Quarterly",
                    "Monthly",
                    "Weekly/Ongoing",
                    "AI provides real-time guidance instead"
                ],
                scoring: {
                    "Never - agents learn on their own": 0,
                    "Annually": 10,
                    "Quarterly": 18,
                    "Monthly": 25,
                    "Weekly/Ongoing": 30,
                    "AI provides real-time guidance instead": 33
                }
            },
            {
                id: "procedure_questions",
                label: "When agents have questions about company procedures or standards, they:",
                type: "select",
                options: [
                    "Figure it out themselves",
                    "Ask whoever's available",
                    "Check scattered emails/documents",
                    "Access a central knowledge base",
                    "Get instant AI-powered answers"
                ],
                scoring: {
                    "Figure it out themselves": 5,
                    "Ask whoever's available": 10,
                    "Check scattered emails/documents": 15,
                    "Access a central knowledge base": 25,
                    "Get instant AI-powered answers": 33
                }
            },
            {
                id: "legal_questions",
                label: "When contract or state law questions arise, your agents:",
                type: "select",
                options: [
                    "Google it",
                    "Call the broker (interrupting their day)",
                    "Consult external legal hotline ($$$)",
                    "Search internal resources",
                    "AI instantly provides cited answers"
                ],
                scoring: {
                    "Google it": 2,
                    "Call the broker (interrupting their day)": 8,
                    "Consult external legal hotline ($$$)": 15,
                    "Search internal resources": 23,
                    "AI instantly provides cited answers": 34
                }
            }
        ]
    },
    clientExperience: {
        title: "Client Experience & Transparency",
        questions: [
            {
                id: "client_deadlines_breakdown",
                label: "Do you provide clients with a comprehensive breakdown of their deadlines and responsibilities?",
                type: "select",
                options: [
                    "No formal system",
                    "Agent explains verbally",
                    "Email key dates as needed",
                    "Standard timeline template",
                    "Digital portal with all dates",
                    "AI-powered dashboard with alerts"
                ],
                scoring: {
                    "No formal system": 0,
                    "Agent explains verbally": 8,
                    "Email key dates as needed": 15,
                    "Standard timeline template": 22,
                    "Digital portal with all dates": 28,
                    "AI-powered dashboard with alerts": 33
                }
            },
            {
                id: "client_document_understanding",
                label: "What percentage of your clients actually read and understand all transaction documents?",
                type: "select",
                options: [
                    "Under 10%",
                    "10-25%",
                    "25-50%",
                    "50-75%",
                    "Over 75%",
                    "We ensure understanding with AI summaries"
                ],
                scoring: {
                    "Under 10%": 3,
                    "10-25%": 10,
                    "25-50%": 17,
                    "50-75%": 24,
                    "Over 75%": 29,
                    "We ensure understanding with AI summaries": 33
                }
            },
            {
                id: "brokerage_liability",
                label: "How much liability does your brokerage assume for ensuring clients fully understand all documents?",
                type: "select",
                options: [
                    "Complete liability - it's on us",
                    "Significant liability",
                    "Moderate - shared with agent",
                    "Minimal - client signs they've read",
                    "Protected - we document everything",
                    "Protected with AI-verified comprehension"
                ],
                scoring: {
                    "Complete liability - it's on us": 5,
                    "Significant liability": 10,
                    "Moderate - shared with agent": 18,
                    "Minimal - client signs they've read": 23,
                    "Protected - we document everything": 28,
                    "Protected with AI-verified comprehension": 34
                }
            }
        ]
    },
    riskManagement: {
        title: "Risk Management & Protection",
        questions: [
            {
                id: "revenue_loss",
                label: "Estimated revenue lost to missed deadlines/failed deals last year?",
                type: "select",
                options: [
                    "Not calculated",
                    "Over $500K",
                    "$200K-$500K",
                    "$100K-$200K",
                    "$50K-$100K",
                    "Under $50K"
                ],
                scoring: {
                    "Not calculated": 0,
                    "Over $500K": 5,
                    "$200K-$500K": 12,
                    "$100K-$200K": 20,
                    "$50K-$100K": 27,
                    "Under $50K": 33
                }
            },
            {
                id: "eo_claims",
                label: "Number of E&O claims in last 3 years?",
                type: "select",
                options: [
                    "5+",
                    "3-4",
                    "1-2",
                    "0",
                    "0 with proactive monitoring"
                ],
                scoring: {
                    "5+": 5,
                    "3-4": 15,
                    "1-2": 25,
                    "0": 30,
                    "0 with proactive monitoring": 34
                }
            }
        ]
    },
    growthReadiness: {
        title: "BONUS: Growth Acceleration",
        questions: [
            {
                id: "verified_seller_leads",
                label: "If you could receive 100% verified seller leads (only pay at contract), would you be interested?",
                type: "select",
                options: [
                    "No, we can't handle more volume",
                    "Probably not",
                    "Maybe, need more details",
                    "Yes, depending on pricing",
                    "Absolutely - sign us up"
                ],
                scoring: {
                    "No, we can't handle more volume": 0,
                    "Probably not": 5,
                    "Maybe, need more details": 15,
                    "Yes, depending on pricing": 25,
                    "Absolutely - sign us up": 33
                }
            },
            {
                id: "lead_followup_system",
                label: "Do you have a system to ensure agents follow up with leads in a timely manner?",
                type: "select",
                options: [
                    "No system - trust agents to handle",
                    "Manual tracking by managers",
                    "Basic CRM reminders",
                    "Automated follow-up sequences",
                    "AI-powered lead nurturing",
                    "Full automation with accountability"
                ],
                scoring: {
                    "No system - trust agents to handle": 0,
                    "Manual tracking by managers": 8,
                    "Basic CRM reminders": 15,
                    "Automated follow-up sequences": 22,
                    "AI-powered lead nurturing": 28,
                    "Full automation with accountability": 34
                }
            }
        ]
    }
};

/**
 * Maximum Scores by Category:
 * - Transaction Oversight: 100 points (3 questions × 33-34 pts each)
 * - Operational Systems: 100 points (3 questions × 33-34 pts each)
 * - Knowledge Management: 100 points (3 questions × 33-34 pts each)
 * - Client Experience: 100 points (3 questions × 33-34 pts each)
 * - Risk Management: 67 points (2 questions × 33-34 pts each)
 * - Growth Readiness (BONUS): 67 points (2 questions × 33-34 pts each)
 *
 * TOTAL POSSIBLE: 534 points
 * Converted to 0-100 scale
 */

// Scoring calculation function
const calculateScores = (responses) => {
    let scores = {
        transactionOversight: 0,
        operationalSystems: 0,
        knowledgeManagement: 0,
        clientExperience: 0,
        riskManagement: 0,
        growthReadiness: 0,
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

    // Calculate overall score (out of 100)
    const totalScore = scores.transactionOversight + scores.operationalSystems +
                      scores.knowledgeManagement + scores.clientExperience +
                      scores.riskManagement;

    // Max possible score: 100+100+100+100+67 = 467 (excluding bonus)
    scores.overall = Math.round((totalScore / 467) * 100);

    // Determine risk level
    if (scores.overall >= 85) scores.riskLevel = "LOW";
    else if (scores.overall >= 70) scores.riskLevel = "MODERATE";
    else if (scores.overall >= 50) scores.riskLevel = "HIGH";
    else scores.riskLevel = "CRITICAL";

    // Determine percentile
    if (scores.overall >= 85) scores.percentile = "Top 5%";
    else if (scores.overall >= 70) scores.percentile = "Top 25%";
    else if (scores.overall >= 50) scores.percentile = "Top 50%";
    else scores.percentile = "Bottom 50%";

    return scores;
};

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        assessmentQuestions,
        calculateScores
    };
}
