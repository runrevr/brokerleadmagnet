// Conservative ROI Calculator for ContRE Lead Magnet
// Optimized for 50-150 agent brokerages with realistic time assumptions

/**
 * Estimates ContRE monthly cost based on brokerage size
 */
function estimateContreCost(agentCount) {
  if (agentCount < 50) return 750;
  if (agentCount <= 100) return 1200;
  if (agentCount <= 150) return 1500;
  return 2000;
}

/**
 * Estimates monthly transactions (conservative: 2 per agent)
 */
function estimateTransactions(agentCount) {
  return Math.round(agentCount * 2);
}

/**
 * Calculate realistic ROI for ContRE platform
 * Accounts for transaction volume, multiple parties, and revenue protection
 */
function calculateConservativeROI(assessmentData) {
  const agentCount = assessmentData.agentCount || 75;
  const transactionsPerMonth = estimateTransactions(agentCount);
  const annualTransactions = transactionsPerMonth * 12;

  // Realistic time per transaction (multiple parties involved)
  const currentAgentHoursPerTransaction = 1.5; // Doc review, questions, coordination
  const currentBrokerHoursPerTransaction = 1; // Review, oversight per transaction
  const currentTCHoursPerTransaction = 0.5; // TC coordination time
  const brokerQuestionHoursPerWeek = 10; // Broker spends ~10hrs/week answering questions

  // With ContRE (60% reduction - realistic with AI automation)
  const contreAgentHoursPerTransaction = 0.6; // 60% time savings via AI summaries + chatbot
  const contreBrokerHoursPerTransaction = 0.4; // 60% time savings via dashboard oversight
  const contreTCHoursPerTransaction = 0.2; // 60% time savings
  const contreBrokerQuestionHoursPerWeek = 2; // 80% reduction via 24/7 chatbot

  // Calculate annual time savings
  const annualAgentHoursSaved = (currentAgentHoursPerTransaction - contreAgentHoursPerTransaction) * annualTransactions;
  const annualBrokerHoursSaved = (currentBrokerHoursPerTransaction - contreBrokerHoursPerTransaction) * annualTransactions;
  const annualTCHoursSaved = (currentTCHoursPerTransaction - contreTCHoursPerTransaction) * annualTransactions;
  const annualQuestionHoursSaved = (brokerQuestionHoursPerWeek - contreBrokerQuestionHoursPerWeek) * 52;

  // Dollar values (realistic hourly rates)
  const agentHourlyValue = 50; // Agent billable time value
  const brokerHourlyValue = 100; // Broker/owner time value
  const tcHourlyValue = 40; // TC hourly cost
  const brokerQuestionValue = 125; // Higher value due to interruption cost + context switching

  // Calculate dollar savings
  const annualAgentTimeSavings = Math.round(annualAgentHoursSaved * agentHourlyValue);
  const annualBrokerTimeSavings = Math.round(annualBrokerHoursSaved * brokerHourlyValue);
  const annualTCTimeSavings = Math.round(annualTCHoursSaved * tcHourlyValue);
  const annualQuestionSavings = Math.round(annualQuestionHoursSaved * brokerQuestionValue);
  const annualTimeSavings = annualAgentTimeSavings + annualBrokerTimeSavings + annualTCTimeSavings + annualQuestionSavings;

  // Revenue protection (realistic - 2-3% of deals saved per year)
  const dealsAtRiskPercent = 0.025; // 2.5% of transactions have issues
  const dealsAtRisk = Math.round(annualTransactions * dealsAtRiskPercent);
  const avgCommissionPerDeal = 8000; // Average commission per transaction
  const dealsSaved = Math.max(2, Math.round(dealsAtRisk * 0.5)); // Save 50% of at-risk deals (conservative)
  const revenueProtection = dealsSaved * avgCommissionPerDeal;

  // Risk mitigation value (scaled to transaction volume)
  const deadlineMissRate = Math.max(2, Math.round(annualTransactions * 0.015)); // 1.5% miss rate
  const deadlineMissPrevention = deadlineMissRate * 2500; // Average cost per missed deadline
  const eoRiskReduction = Math.round(agentCount * 150); // $150 per agent in reduced E&O exposure
  const commissionAnomalyCatches = Math.max(3, Math.round(annualTransactions * 0.02)) * 750; // 2% catch rate

  const annualRiskValue = deadlineMissPrevention + eoRiskReduction + commissionAnomalyCatches;

  // Total value (including revenue protection)
  const totalAnnualValue = annualTimeSavings + revenueProtection + annualRiskValue;

  // ContRE investment
  const contreMonthlyCost = estimateContreCost(agentCount);
  const contreAnnualCost = contreMonthlyCost * 12;

  // ROI calculation
  const netAnnualBenefit = totalAnnualValue - contreAnnualCost;
  const roi = (netAnnualBenefit / contreAnnualCost).toFixed(1);

  // Determine target market fit
  let targetMarketFit = "below-target";
  let targetMarketMessage = "ContRE typically delivers best ROI for 50+ agent brokerages. That said, if you're spending 10+ hours/week on document review and agent questions, the math may still work for your specific situation.";

  if (agentCount >= 50 && agentCount <= 150) {
    targetMarketFit = "ideal";
    targetMarketMessage = `At ${agentCount} agents, you're in the sweet spot where ContRE delivers clearest ROI. Large enough that operational strain is real, nimble enough for quick implementation.`;
  } else if (agentCount > 150) {
    targetMarketFit = "large";
    targetMarketMessage = `At your scale, transaction intelligence isn't optional—it's essential infrastructure. ContRE becomes your operational backbone, handling ${transactionsPerMonth}+ transactions/month with systematic oversight.`;
  }

  return {
    assumptions: {
      agentCount,
      transactionsPerMonth,
      annualTransactions,
      currentAgentTimePerTransaction: "1.5 hours (doc review + coordination)",
      currentBrokerTimePerTransaction: "1 hour (review + oversight)",
      brokerQuestionTime: "10 hours/week",
      timeReductionAssumption: "60% (realistic with AI automation)",
      note: "Accounts for all parties involved (agents, broker, TC) across all transactions"
    },

    timeSavings: {
      annual: {
        agentTime: annualAgentTimeSavings,
        agentHours: Math.round(annualAgentHoursSaved),
        brokerTime: annualBrokerTimeSavings,
        brokerHours: Math.round(annualBrokerHoursSaved),
        tcTime: annualTCTimeSavings,
        tcHours: Math.round(annualTCHoursSaved),
        questionHandling: annualQuestionSavings,
        questionHours: Math.round(annualQuestionHoursSaved),
        total: annualTimeSavings
      },
      calculations: {
        agentCalc: `${Math.round(annualAgentHoursSaved)} hours saved × $${agentHourlyValue}/hr`,
        brokerCalc: `${Math.round(annualBrokerHoursSaved)} hours saved × $${brokerHourlyValue}/hr`,
        tcCalc: `${Math.round(annualTCHoursSaved)} hours saved × $${tcHourlyValue}/hr`,
        questionCalc: `${Math.round(annualQuestionHoursSaved)} hours saved × $${brokerQuestionValue}/hr`
      }
    },

    revenueProtection: {
      dealsSaved,
      avgCommission: avgCommissionPerDeal,
      totalRevenue: revenueProtection,
      note: `Preventing ${dealsSaved} deal failures per year at $${avgCommissionPerDeal.toLocaleString()} avg commission`
    },

    riskMitigation: {
      deadlines: deadlineMissPrevention,
      deadlinesNote: `Preventing ${deadlineMissRate} missed deadlines per year at $2,500 average cost`,
      eo: eoRiskReduction,
      eoNote: `$150 per agent in reduced E&O risk exposure`,
      commissions: commissionAnomalyCatches,
      commissionsNote: `Catching commission anomalies before contract signing`,
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
      contreInvestment: `$${(contreAnnualCost / 1000).toFixed(0)}K`,
      investment: contreAnnualCost,
      netBenefit: Math.round(netAnnualBenefit),
      roi: `${roi}:1`,
      isPositiveROI: netAnnualBenefit > 0,
      targetMarketFit,
      targetMarketMessage,
      note: `Based on ${annualTransactions} annual transactions with ${agentCount} agents. Accounts for time savings across all parties, revenue protection from prevented deal failures, and risk mitigation.`
    }
  };
}

module.exports = {
  calculateConservativeROI,
  estimateContreCost,
  estimateTransactions
};
