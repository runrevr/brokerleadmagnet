/**
 * Test AI Integration
 *
 * This script tests the AI preview and full analysis generation
 * Run with: node test-ai-integration.js
 */

require('dotenv').config();
const { generateExecutiveSummary, generateFullAnalysis } = require('./api/ai-integration');

// Sample assessment data
const sampleAssessment = {
  companyName: "Acme Realty Group",
  companySize: "26-50",
  monthlyTransactions: "21-50",
  primaryMarket: "Austin, TX",
  overallScore: 58,
  riskLevel: "HIGH",
  categoryScores: [
    { category: 'Transaction Oversight', score: 48, maxScore: 100, percentage: 48 },
    { category: 'Operational Systems', score: 53, maxScore: 100, percentage: 53 },
    { category: 'Knowledge Management', score: 69, maxScore: 100, percentage: 69 },
    { category: 'Client Experience', score: 63, maxScore: 100, percentage: 63 },
    { category: 'Risk Management', score: 39, maxScore: 67, percentage: 58 }
  ],
  responses: [
    {
      questionId: "contract_oversight",
      questionText: "Who is responsible for contract oversight in your brokerage?",
      answer: "Transaction Coordinator only",
      pointsEarned: 10
    },
    {
      questionId: "document_review_time",
      questionText: "How long does it take to effectively review ALL documents in a typical transaction?",
      answer: "3-5 hours",
      pointsEarned: 10
    },
    {
      questionId: "agent_document_reading",
      questionText: "Are agents expected to read every line of HOAs, title reports, inspection reports?",
      answer: "Expected but 25-50% do",
      pointsEarned: 10
    },
    {
      questionId: "deadline_tracking_system",
      questionText: "Do you have a system to track all transaction deadlines?",
      answer: "Basic transaction software",
      pointsEarned: 20
    },
    {
      questionId: "missed_deadlines",
      questionText: "How many transaction deadlines were missed last quarter?",
      answer: "6-10",
      pointsEarned: 10
    },
    {
      questionId: "deal_losses",
      questionText: "Have you ever lost a deal or made brokerage concessions at closing due to issues identified too late?",
      answer: "Regularly (6-10 times per year)",
      pointsEarned: 10
    },
    {
      questionId: "agent_training_frequency",
      questionText: "How often do you conduct mandatory agent training on forms/contracts?",
      answer: "Quarterly",
      pointsEarned: 18
    },
    {
      questionId: "procedure_questions",
      questionText: "When agents have questions about company procedures or standards, they:",
      answer: "Access a central knowledge base",
      pointsEarned: 25
    },
    {
      questionId: "legal_questions",
      questionText: "When contract or state law questions arise, your agents:",
      answer: "Search internal resources",
      pointsEarned: 23
    },
    {
      questionId: "client_deadlines_breakdown",
      questionText: "Do you provide clients with a comprehensive breakdown of their deadlines and responsibilities?",
      answer: "Standard timeline template",
      pointsEarned: 22
    },
    {
      questionId: "client_document_understanding",
      questionText: "What percentage of your clients actually read and understand all transaction documents?",
      answer: "25-50%",
      pointsEarned: 17
    },
    {
      questionId: "brokerage_liability",
      questionText: "How much liability does your brokerage assume for ensuring clients fully understand all documents?",
      answer: "Moderate - shared with agent",
      pointsEarned: 18
    },
    {
      questionId: "revenue_loss",
      questionText: "Estimated revenue lost to missed deadlines/failed deals last year?",
      answer: "$100K-$200K",
      pointsEarned: 20
    },
    {
      questionId: "eo_claims",
      questionText: "Number of E&O claims in last 3 years?",
      answer: "1-2",
      pointsEarned: 25
    }
  ]
};

async function testAI() {
  console.log('='.repeat(80));
  console.log('AI INTEGRATION TEST');
  console.log('='.repeat(80));
  console.log('');

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not set in .env file');
    console.error('Please add your API key to .env:');
    console.error('  ANTHROPIC_API_KEY=sk-ant-api03-...');
    process.exit(1);
  }

  console.log('✓ API key found');
  console.log('');

  // Test 1: Executive Summary
  console.log('-'.repeat(80));
  console.log('TEST 1: Executive Summary (Tier 1 - Free Preview)');
  console.log('-'.repeat(80));
  console.log('');

  try {
    console.log('Generating AI executive summary for:', sampleAssessment.companyName);
    console.log('Overall Score:', sampleAssessment.overallScore);
    console.log('Risk Level:', sampleAssessment.riskLevel);
    console.log('');

    const startTime = Date.now();
    const summary = await generateExecutiveSummary(sampleAssessment);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✓ Generation successful!');
    console.log(`Duration: ${duration} seconds`);
    console.log('');
    console.log('AI-GENERATED SUMMARY:');
    console.log('─'.repeat(80));
    console.log(summary);
    console.log('─'.repeat(80));
    console.log('');

  } catch (error) {
    console.error('✗ Test 1 FAILED:', error.message);
    console.error('');
    process.exit(1);
  }

  // Test 2: Full Analysis
  console.log('-'.repeat(80));
  console.log('TEST 2: Full Analysis (Tier 2 - Email-Gated)');
  console.log('-'.repeat(80));
  console.log('');

  try {
    console.log('Generating comprehensive AI analysis...');
    console.log('This will take longer (5-15 seconds)...');
    console.log('');

    const startTime = Date.now();
    const analysis = await generateFullAnalysis(sampleAssessment);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✓ Generation successful!');
    console.log(`Duration: ${duration} seconds`);
    console.log('');

    console.log('ANALYSIS COMPONENTS:');
    console.log('─'.repeat(80));
    console.log(`• Gap Analysis: ${analysis.gapAnalysis?.length || 0} gaps identified`);
    console.log(`• Roadmap: Quick Wins (${analysis.roadmap?.quickWins?.length || 0}), Foundation (${analysis.roadmap?.foundationBuilding?.length || 0}), Transformation (${analysis.roadmap?.transformation?.length || 0})`);
    console.log(`• Competitive Positioning: ${analysis.competitivePositioning ? '✓' : '✗'}`);
    console.log(`• Financial Impact: ${analysis.financialImpact ? '✓' : '✗'}`);
    console.log(`• Recommendations: ${analysis.specificRecommendations?.length || 0} tactical items`);
    console.log(`• Archetype: ${analysis.archetype?.type || 'N/A'}`);
    console.log(`• Key Insight: ${analysis.keyInsight ? '✓' : '✗'}`);
    console.log('─'.repeat(80));
    console.log('');

    // Show sample gap
    if (analysis.gapAnalysis && analysis.gapAnalysis.length > 0) {
      console.log('SAMPLE GAP (First identified issue):');
      console.log('─'.repeat(80));
      const gap = analysis.gapAnalysis[0];
      console.log(`Category: ${gap.category}`);
      console.log(`Issue: ${gap.issue}`);
      console.log(`Severity: ${gap.severity}`);
      console.log(`Business Impact:`);
      console.log(`  - Time Wasted: ${gap.businessImpact?.timeWasted || 'N/A'}`);
      console.log(`  - Financial Cost: ${gap.businessImpact?.financialCost || 'N/A'}`);
      console.log(`  - Risk Created: ${gap.businessImpact?.riskCreated || 'N/A'}`);
      console.log(`Best Practice Solution:`);
      console.log(`  ${gap.industryBestPractice || 'N/A'}`);
      console.log('─'.repeat(80));
      console.log('');
    }

    // Show archetype
    if (analysis.archetype) {
      console.log('BROKERAGE ARCHETYPE:');
      console.log('─'.repeat(80));
      console.log(`Type: ${analysis.archetype.type}`);
      console.log(`Description: ${analysis.archetype.description}`);
      console.log('─'.repeat(80));
      console.log('');
    }

    // Show key insight
    if (analysis.keyInsight) {
      console.log('KEY INSIGHT:');
      console.log('─'.repeat(80));
      console.log(analysis.keyInsight);
      console.log('─'.repeat(80));
      console.log('');
    }

    // Full JSON for review
    console.log('FULL ANALYSIS JSON:');
    console.log('─'.repeat(80));
    console.log(JSON.stringify(analysis, null, 2));
    console.log('─'.repeat(80));
    console.log('');

  } catch (error) {
    console.error('✗ Test 2 FAILED:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
    process.exit(1);
  }

  // Success
  console.log('='.repeat(80));
  console.log('ALL TESTS PASSED! ✓');
  console.log('='.repeat(80));
  console.log('');
  console.log('Next steps:');
  console.log('1. Review the AI-generated content above');
  console.log('2. Verify it naturally positions your product features');
  console.log('3. Update report.html to display these insights');
  console.log('4. Test with real assessment data');
  console.log('');
}

// Run tests
testAI().catch(error => {
  console.error('UNEXPECTED ERROR:', error);
  process.exit(1);
});
