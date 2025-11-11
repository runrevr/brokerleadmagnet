// Conservative ROI Calculator for ContRE (Agent Version)
// Optimized for individual agents and small teams with realistic time assumptions

/**
 * Estimates ContRE monthly cost for agents
 * Agents typically pay individual subscription rates
 */
function estimateContreCost(transactionsPerMonth) {
  // Tiered pricing based on transaction volume
  if (transactionsPerMonth < 3) return 99; // Low-volume agent
  if (transactionsPerMonth <= 5) return 149; // Average agent
  if (transactionsPerMonth <= 8) return 199; // High-volume agent
  return 249; // Top producer
}

/**
 * Calculate realistic ROI for ContRE platform (Agent perspective)
 * Focuses on individual agent time savings, deal protection, and risk mitigation
 */
function calculateConservativeROI(assessmentData) {
  const transactionsPerMonth = assessmentData.monthlyTransactions || 3;
  const annualTransactions = transactionsPerMonth * 12;

  // Realistic time per transaction for agents
  const currentDocReviewHours = 2.5; // Reading contracts, disclosures, HOAs, title reports
  const currentDeadlineTrackingHours = 0.5; // Manual calendar entry and monitoring
  const currentClientQuestionHours = 1; // Answering client questions, explaining docs
  const currentBrokerConsultHours = 0.25; // Calling broker for questions per transaction

  // With ContRE (50-70% reduction - realistic with AI automation)
  const contreDocReviewHours = 0.75; // AI summaries reduce reading time by 70%
  const contreDeadlineTrackingHours = 0.1; // Automated extraction reduces by 80%
  const contreClientQuestionHours = 0.3; // Chatbot handles 70% of routine questions
  const contreBrokerConsultHours = 0.1; // AI answers routine questions, reducing broker calls by 60%

  // Calculate annual time savings
  const annualDocReviewSaved = (currentDocReviewHours - contreDocReviewHours) * annualTransactions;
  const annualDeadlineTrackingSaved = (currentDeadlineTrackingHours - contreDeadlineTrackingHours) * annualTransactions;
  const annualClientQuestionSaved = (currentClientQuestionHours - contreClientQuestionHours) * annualTransactions;
  const annualBrokerConsultSaved = (currentBrokerConsultHours - contreBrokerConsultHours) * annualTransactions;

  const totalHoursSaved = annualDocReviewSaved + annualDeadlineTrackingSaved + annualClientQuestionSaved + annualBrokerConsultSaved;

  // Dollar values (agent's time value)
  const agentHourlyValue = 75; // Agent's billable time value (conservative)

  // Calculate dollar savings
  const annualDocReviewValue = Math.round(annualDocReviewSaved * agentHourlyValue);
  const annualDeadlineValue = Math.round(annualDeadlineTrackingSaved * agentHourlyValue);
  const annualClientQuestionValue = Math.round(annualClientQuestionSaved * agentHourlyValue);
  const annualBrokerConsultValue = Math.round(annualBrokerConsultSaved * agentHourlyValue);
  const annualTimeSavings = annualDocReviewValue + annualDeadlineValue + annualClientQuestionValue + annualBrokerConsultValue;

  // Revenue protection (realistic - 2-3% of deals at risk per year)
  const dealsAtRiskPercent = 0.025; // 2.5% of transactions have issues
  const dealsAtRisk = Math.max(1, Math.round(annualTransactions * dealsAtRiskPercent));
  const avgCommissionPerDeal = 7500; // Average agent commission per transaction
  const dealsSaved = Math.max(1, Math.round(dealsAtRisk * 0.5)); // Save 50% of at-risk deals (conservative)
  const revenueProtection = dealsSaved * avgCommissionPerDeal;

  // Risk mitigation value
  const deadlineMissRate = Math.max(1, Math.round(annualTransactions * 0.02)); // 2% miss rate
  const deadlineMissPrevention = deadlineMissRate * 2000; // Average cost per missed deadline for agent
  const eoRiskReduction = 500; // Annual E&O risk reduction value
  const clientSatisfactionValue = 1000; // Better client experience → referrals and repeat business

  const annualRiskValue = deadlineMissPrevention + eoRiskReduction + clientSatisfactionValue;

  // Total value (including revenue protection)
  const totalAnnualValue = annualTimeSavings + revenueProtection + annualRiskValue;

  // ContRE investment
  const contreMonthlyCost = estimateContreCost(transactionsPerMonth);
  const contreAnnualCost = contreMonthlyCost * 12;

  // ROI calculation
  const netAnnualBenefit = totalAnnualValue - contreAnnualCost;
  const roi = (netAnnualBenefit / contreAnnualCost).toFixed(1);

  // Determine target market fit
  let targetMarketFit = "below-target";
  let targetMarketMessage = "ContRE delivers best ROI for agents doing 3+ transactions per month. If you're spending 5+ hours per transaction on document review and client questions, the time savings alone may justify the investment.";

  if (transactionsPerMonth >= 3 && transactionsPerMonth <= 8) {
    targetMarketFit = "ideal";
    targetMarketMessage = `At ${transactionsPerMonth} transactions per month, you're in the sweet spot where ContRE delivers immediate, measurable ROI. You're busy enough that time savings matter, but not so busy that you can't implement new tools.`;
  } else if (transactionsPerMonth > 8) {
    targetMarketFit = "high-volume";
    targetMarketMessage = `At your transaction volume, ContRE isn't optional—it's essential infrastructure. You're managing ${transactionsPerMonth * 12} deals per year, and ContRE becomes your AI assistant handling the time-consuming work while you focus on clients and closing deals.`;
  } else if (transactionsPerMonth < 3) {
    targetMarketMessage = `At ${transactionsPerMonth} transactions per month, ContRE may still make sense if you value your time highly or struggle with deadline tracking. The risk mitigation alone can pay for the investment if it prevents even one deal failure.`;
  }

  return {
    assumptions: {
      transactionsPerMonth,
      annualTransactions,
      currentDocReviewTime: "2.5 hours per transaction",
      currentDeadlineTime: "0.5 hours per transaction",
      currentClientQuestionTime: "1 hour per transaction",
      timeReductionAssumption: "50-70% (realistic with AI automation)",
      agentHourlyValue: `$${agentHourlyValue}`,
      note: "Based on typical agent workflow across all transactions"
    },

    timeSavings: {
      annual: {
        docReview: annualDocReviewValue,
        docReviewHours: Math.round(annualDocReviewSaved),
        deadlineTracking: annualDeadlineValue,
        deadlineHours: Math.round(annualDeadlineTrackingSaved),
        clientQuestions: annualClientQuestionValue,
        clientQuestionHours: Math.round(annualClientQuestionSaved),
        brokerConsult: annualBrokerConsultValue,
        brokerConsultHours: Math.round(annualBrokerConsultSaved),
        total: annualTimeSavings,
        totalHours: Math.round(totalHoursSaved)
      },
      calculations: {
        docReviewCalc: `${Math.round(annualDocReviewSaved)} hours saved × $${agentHourlyValue}/hr`,
        deadlineCalc: `${Math.round(annualDeadlineTrackingSaved)} hours saved × $${agentHourlyValue}/hr`,
        clientQuestionCalc: `${Math.round(annualClientQuestionSaved)} hours saved × $${agentHourlyValue}/hr`,
        brokerConsultCalc: `${Math.round(annualBrokerConsultSaved)} hours saved × $${agentHourlyValue}/hr`
      },
      perTransaction: {
        hoursSaved: Math.round((totalHoursSaved / annualTransactions) * 10) / 10,
        valueSaved: Math.round(annualTimeSavings / annualTransactions),
        note: "Average time savings per transaction"
      }
    },

    revenueProtection: {
      dealsSaved,
      avgCommission: avgCommissionPerDeal,
      totalRevenue: revenueProtection,
      note: `Preventing ${dealsSaved} deal ${dealsSaved === 1 ? 'failure' : 'failures'} per year at $${avgCommissionPerDeal.toLocaleString()} avg commission`
    },

    riskMitigation: {
      deadlines: deadlineMissPrevention,
      deadlinesNote: `Preventing ${deadlineMissRate} missed ${deadlineMissRate === 1 ? 'deadline' : 'deadlines'} per year at $2,000 average cost`,
      eo: eoRiskReduction,
      eoNote: `Reduced E&O risk exposure through documented client interactions`,
      clientSatisfaction: clientSatisfactionValue,
      clientSatisfactionNote: `Better client experience leads to more referrals and repeat business`,
      total: annualRiskValue
    },

    investment: {
      monthly: contreMonthlyCost,
      annual: contreAnnualCost
    },

    bottomLine: {
      timeSavingsValue: annualTimeSavings,
      revenueProtectionValue: revenueProtection,
      riskMitigationValue: annualRiskValue,
      totalAnnualValue: Math.round(totalAnnualValue),
      contreInvestment: `$${(contreAnnualCost / 1000).toFixed(1)}K`,
      investment: contreAnnualCost,
      netBenefit: Math.round(netAnnualBenefit),
      roi: `${roi}:1`,
      isPositiveROI: netAnnualBenefit > 0,
      targetMarketFit,
      targetMarketMessage,
      breakEvenDeals: Math.ceil(contreAnnualCost / avgCommissionPerDeal * 10) / 10,
      note: `Based on ${annualTransactions} annual transactions. ContRE pays for itself by preventing just ${Math.ceil(contreAnnualCost / avgCommissionPerDeal * 10) / 10} deal ${Math.ceil(contreAnnualCost / avgCommissionPerDeal) === 1 ? 'failure' : 'failures'} per year, or by saving you ${Math.round(contreAnnualCost / agentHourlyValue)} hours of your time.`
    }
  };
}

module.exports = {
  calculateConservativeROI,
  estimateContreCost
};
