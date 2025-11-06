/**
 * AI-Optimized Brokerage Risk Scoring Algorithm
 *
 * Evaluates brokerages across 14 key dimensions
 * Total: 100 points
 * Compares to AI-optimized benchmark (95-100 points)
 */

const scoringRules = {
    // Q2: Contract Review Process (8 points)
    contract_review_process: {
        weight: 8,
        scores: {
            "Broker & TC - TC reviews, Broker supervises": 8,
            "Designated Broker - Broker reviews everything": 6,
            "Transaction Coordinator - TC handles all reviews": 5,
            "Agent - Each agent handles their own": 2,
            "No formal process - varies by transaction": 0
        },
        category: "process_efficiency",
        aiOptimized: "Broker & TC - TC reviews, Broker supervises"
    },

    // Q3: Contract Review Time (7 points)
    contract_review_time: {
        weight: 7,
        scores: {
            "Under 30 Minutes - Quick, systemic Review": 7,
            "30 - 1 Hour - Thorough manual review": 5,
            "1-2 Hours - Detailed Line by Line (Standard)": 4,
            "2-3 Hours - Very Time Intensive": 2,
            "3+ Hours - Extremely Complex & Time Consuming": 1,
            "Varies - No Specific Systems in Place": 0
        },
        category: "process_efficiency",
        aiOptimized: "Under 30 Minutes - Quick, systemic Review"
    },

    // Q4: Document Review Process (9 points)
    document_review_process: {
        weight: 9,
        scores: {
            "TC/Broker reviews for them - Agents get summaries/highlights": 9,
            "Agents read everything - Required and consistently done": 7,
            "Agents are supposed to… But most skim or skip sections": 3,
            "Agents handle their own way - No formal policy or oversight": 1,
            "Honestly? Nobody reads them all, too time consuming. Cross fingers and pray.": 0
        },
        category: "process_efficiency",
        aiOptimized: "TC/Broker reviews for them - Agents get summaries/highlights"
    },

    // Q5: Deadline Tracking Method (10 points)
    deadline_tracking_method: {
        weight: 10,
        scores: {
            "Automated deadline tracking - System extracts and monitors dates automatically": 10,
            "Centralized TC/Admin system - TC manually enters all dates into shared calendar/system": 7,
            "Shared calendar/spreadsheet - Agents update their own dates in shared system": 4,
            "Each agent uses their own - Personal calendar/reminders. No centralized tracking": 2,
            "Manual - paper/memory based. Agents track on paper or rely on memory": 0,
            "No formal tracking system - Varies by agent": 0
        },
        category: "risk_management",
        aiOptimized: "Automated deadline tracking - System extracts and monitors dates automatically"
    },

    // Q6: Deadline Impact (10 points)
    deadline_impact: {
        weight: 10,
        scores: {
            "No - clean track record. Zero lost deals or concessions": 10,
            "Close calls, but no losses. Caught issues just in time": 7,
            "1-2 deals impacted - Minor financial impact": 4,
            "3-5 deals lost or concessions - Significant financial impact": 2,
            "5+ deals affected - Major ongoing problem": 0,
            "We don't track this data - No formal tracking system": 0
        },
        category: "risk_management",
        aiOptimized: "No - clean track record. Zero lost deals or concessions"
    },

    // Q7: Training Frequency (6 points)
    training_frequency: {
        weight: 6,
        scores: {
            "Monthly - ongoing education, regular reinforcement": 6,
            "Quarterly - seasonal updates. Around four times per year": 5,
            "Twice per year - Semi-annual training": 3,
            "Annually - once per year. Meets minimum requirement": 2,
            "Only during initial onboarding - No ongoing training": 0,
            "Honestly, we're behind. Struggle to keep up with it": 0
        },
        category: "training_knowledge",
        aiOptimized: "Monthly - ongoing education, regular reinforcement"
    },

    // Q8: Agent Question Handling (7 points)
    agent_question_handling: {
        weight: 7,
        scores: {
            "Check our knowledge system - Instant self-service answers": 7,
            "Search internal docs/wiki - Company resources available": 5,
            "Email or Slack the Broker/TC - Wait for response": 3,
            "Call/text broker or TC - Interrupt for immediate answer": 2,
            "Ask other agents - Hope someone knows": 1,
            "Google it or wing it - Figure it out themselves": 0
        },
        category: "process_efficiency",
        aiOptimized: "Check our knowledge system - Instant self-service answers"
    },

    // Q10: Client Timeline Communication (8 points)
    client_timeline_communication: {
        weight: 8,
        scores: {
            "Automated client portal - Real-time timeline with updates": 8,
            "Custom timeline document - Personalized for their transaction": 6,
            "Generic checklist/guide - Standard document for all clients": 4,
            "Agent sends periodic updates - Email/text as things progress": 3,
            "Verbal communication only - Agent explains during calls": 1,
            "Clients figure it out - They ask when confused": 0
        },
        category: "client_experience",
        aiOptimized: "Automated client portal - Real-time timeline with updates"
    },

    // Q11: Client Document Reading (7 points)
    client_document_reading: {
        weight: 7,
        scores: {
            "80%+ read everything - Highly engaged clients": 7,
            "50-80% read most documents - Decent engagement": 5,
            "20-50% skim at best - Many just sign": 3,
            "Under 20% read thoroughly - Most clients just trust us": 2,
            "Honestly, very few read it all - They rely on us to explain": 1,
            "We don't really know - Never tracked this": 0
        },
        category: "client_experience",
        aiOptimized: "80%+ read everything - Highly engaged clients"
    },

    // Q12: Client Question Handling (8 points)
    client_question_handling: {
        weight: 8,
        scores: {
            "24/7 AI chatbot - Instant answers anytime, all interactions logged": 8,
            "Email agent, wait for reply - Usually within 24 hours": 5,
            "Call/text agent during business hours - Agent availability limited": 4,
            "Ask at scheduled check-ins - Weekly or milestone meetings": 2,
            "Refer to documents/FAQs - Clients search on their own": 1,
            "Hope they ask if confused - No formal system for questions": 0
        },
        category: "client_experience",
        aiOptimized: "24/7 AI chatbot - Instant answers anytime, all interactions logged"
    },

    // Q13: Client Understanding Liability (10 points)
    client_understanding_liability: {
        weight: 10,
        scores: {
            "Well-protected - We document education access with logged Q&A interactions": 10,
            "Partially protected - We document delivery and verbal explanations": 6,
            "Situational - Depends if we can prove we made ourselves available": 4,
            "Significant exposure - Hard to prove adequate explanation/education": 2,
            "High exposure - We're liable if they claim inadequate disclosure": 0,
            "Honestly uncertain - Never really assessed our liability in this area": 0
        },
        category: "risk_management",
        aiOptimized: "Well-protected - We document education access with logged Q&A interactions"
    },

    // Q14: E&O Claims History (10 points)
    eo_claims_history: {
        weight: 10,
        scores: {
            "No claims, no close calls - Clean record": 10,
            "Close calls, but avoided claims - Caught issues just in time": 6,
            "One claim or serious incident - Learned expensive lessons": 3,
            "Multiple claims or incidents - Ongoing concern": 0,
            "Not sure of our claim history - Would need to check records": 1,
            "Prefer not to disclose": 2
        },
        category: "risk_management",
        aiOptimized: "No claims, no close calls - Clean record"
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
        client_experience: { score: 0, max: 0 },
        training_knowledge: { score: 0, max: 0 }
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

    // Determine risk profile
    const percentage = (totalScore / maxPossibleScore) * 100;
    let riskProfile, profileSummary, percentileRank;

    if (percentage >= 85) {
        riskProfile = "AI-Optimized Leader";
        profileSummary = "Your brokerage operates at the highest industry standard with AI-enhanced systems, comprehensive oversight, and documented client education. You're in the top 5% of brokerages nationally.";
        percentileRank = "95th percentile";
    } else if (percentage >= 70) {
        riskProfile = "Well-Managed Professional";
        profileSummary = "Your brokerage has strong fundamentals with good oversight and training. You're in the top 20% nationally, but could benefit from increased automation and client engagement tools.";
        percentileRank = "80th percentile";
    } else if (percentage >= 50) {
        riskProfile = "Average with Gaps";
        profileSummary = "Your brokerage is performing at the national average, but has significant risk exposure. You're in the middle 50% of brokerages with opportunities to reduce liability through better systems and oversight.";
        percentileRank = "50th percentile";
    } else if (percentage >= 30) {
        riskProfile = "High-Risk Operation";
        profileSummary = "Your brokerage has substantial risk exposure with minimal systematic oversight. You're in the bottom 30% nationally and should prioritize implementing formal processes immediately.";
        percentileRank = "20th percentile";
    } else {
        riskProfile = "Critical Risk";
        profileSummary = "Your brokerage operates with critical risk levels that could result in significant financial and legal exposure. Immediate systematic changes are essential.";
        percentileRank = "Bottom 10%";
    }

    // AI optimization gap
    const aiOptimizedScore = 100; // Perfect AI-optimized score
    const optimizationGap = aiOptimizedScore - totalScore;
    const aiMatchCount = questionResults.filter(r => r.matchesAI).length;

    return {
        totalScore,
        maxPossibleScore,
        percentage: Math.round(percentage),
        riskProfile,
        profileSummary,
        percentileRank,
        categoryBreakdown: {
            processEfficiency: {
                score: categoryScores.process_efficiency.score,
                max: categoryScores.process_efficiency.max,
                percentage: Math.round((categoryScores.process_efficiency.score / categoryScores.process_efficiency.max) * 100)
            },
            riskManagement: {
                score: categoryScores.risk_management.score,
                max: categoryScores.risk_management.max,
                percentage: Math.round((categoryScores.risk_management.score / categoryScores.risk_management.max) * 100)
            },
            clientExperience: {
                score: categoryScores.client_experience.score,
                max: categoryScores.client_experience.max,
                percentage: Math.round((categoryScores.client_experience.score / categoryScores.client_experience.max) * 100)
            },
            trainingKnowledge: {
                score: categoryScores.training_knowledge.score,
                max: categoryScores.training_knowledge.max,
                percentage: Math.round((categoryScores.training_knowledge.score / categoryScores.training_knowledge.max) * 100)
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

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateScore, scoringRules };
}
