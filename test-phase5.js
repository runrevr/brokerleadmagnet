/**
 * Phase 5 Testing Suite
 * Tests report generation, retrieval, and PDF functionality
 *
 * Run with: node test-phase5.js
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`${colors.green}✓${colors.reset} ${testName}`);
    } else {
        testResults.failed++;
        console.log(`${colors.red}✗${colors.reset} ${testName}`);
        if (message) console.log(`  ${colors.red}${message}${colors.reset}`);
    }
}

// Helper function to log section headers
function logSection(title) {
    console.log(`\n${colors.cyan}${title}${colors.reset}`);
    console.log('='.repeat(60));
}

// Sample assessment data for testing
const sampleAssessmentData = {
    companyInfo: {
        company_name: "Test Realty Group",
        agent_count: "26-50",
        monthly_deals: "51-100",
        location: "Austin, TX"
    },
    responses: {
        company_name: "Test Realty Group",
        agent_count: "26-50",
        monthly_deals: "51-100",
        location: "Austin, TX",
        review_capacity: "5-15",
        review_time: "2-3 days",
        deadline_tracking: "Transaction Software",
        failed_deal_analysis: "Written reports",
        knowledge_sharing: "Training sessions",
        contract_standards: "Shared drive",
        update_response_time: "Within 2-4 hours",
        communication_channels: "Portal access",
        transparency_level: "Weekly updates",
        deadline_reminders: "2-3 days before",
        contract_quality: "Checklist system",
        eo_claims: "1-2"
    },
    scores: {
        overall: 68,
        transactionOversight: 22,
        knowledgeManagement: 18,
        clientExperience: 15,
        riskManagement: 20,
        riskLevel: "HIGH",
        percentile: "Top 50%"
    },
    timestamp: new Date().toISOString()
};

/**
 * Test 1: Submit Assessment
 */
async function testAssessmentSubmission() {
    logSection('Test 1: Assessment Submission');

    try {
        const response = await fetch(`${API_BASE}/assessment-submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleAssessmentData)
        });

        const result = await response.json();

        logTest(
            'Assessment submission endpoint responds',
            response.status === 200 || response.status === 201,
            `Status: ${response.status}`
        );

        logTest(
            'Response contains success flag',
            result.success === true,
            `Result: ${JSON.stringify(result)}`
        );

        logTest(
            'Response contains assessmentId',
            result.assessmentId && typeof result.assessmentId === 'string',
            `Assessment ID: ${result.assessmentId}`
        );

        // Store assessment ID for next tests
        if (result.assessmentId) {
            console.log(`${colors.blue}ℹ Assessment ID: ${result.assessmentId}${colors.reset}`);
            return result.assessmentId;
        }

        return null;
    } catch (error) {
        logTest('Assessment submission', false, error.message);
        return null;
    }
}

/**
 * Test 2: Retrieve Assessment Report
 */
async function testReportRetrieval(assessmentId) {
    logSection('Test 2: Report Retrieval');

    if (!assessmentId) {
        logTest('Report retrieval (skipped - no assessment ID)', false, 'Previous test failed');
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/report-get?id=${assessmentId}`);
        const result = await response.json();

        logTest(
            'Report retrieval endpoint responds',
            response.status === 200,
            `Status: ${response.status}`
        );

        logTest(
            'Response contains success flag',
            result.success === true,
            `Result: ${JSON.stringify(result).substring(0, 100)}...`
        );

        logTest(
            'Response contains assessment data',
            result.data !== undefined && result.data !== null,
            'No data in response'
        );

        if (result.data) {
            logTest(
                'Assessment data contains scores',
                result.data.scores !== undefined,
                'Scores missing'
            );

            logTest(
                'Assessment data contains company info',
                result.data.companyInfo !== undefined,
                'Company info missing'
            );

            logTest(
                'Overall score is correct',
                result.data.scores?.overall === 68,
                `Expected 68, got ${result.data.scores?.overall}`
            );

            logTest(
                'Risk level is correct',
                result.data.scores?.riskLevel === 'HIGH',
                `Expected HIGH, got ${result.data.scores?.riskLevel}`
            );

            logTest(
                'Company name is correct',
                result.data.companyInfo?.company_name === 'Test Realty Group',
                `Expected 'Test Realty Group', got '${result.data.companyInfo?.company_name}'`
            );
        }

        return result.data;
    } catch (error) {
        logTest('Report retrieval', false, error.message);
        return null;
    }
}

/**
 * Test 3: Invalid Assessment ID Handling
 */
async function testInvalidAssessmentId() {
    logSection('Test 3: Error Handling');

    const invalidIds = [
        'invalid-uuid',
        '00000000-0000-0000-0000-000000000000',
        'abc123',
        ''
    ];

    for (const invalidId of invalidIds) {
        try {
            const response = await fetch(`${API_BASE}/report-get?id=${invalidId}`);
            const result = await response.json();

            logTest(
                `Invalid ID "${invalidId}" handled gracefully`,
                result.success === false || response.status === 400 || response.status === 404,
                `Should return error, got: ${JSON.stringify(result)}`
            );
        } catch (error) {
            logTest(`Invalid ID "${invalidId}" test`, false, error.message);
        }
    }
}

/**
 * Test 4: Report Page HTML Validation
 */
async function testReportPageHTML() {
    logSection('Test 4: Report Page HTML');

    try {
        const response = await fetch(`${BASE_URL}/report.html`);
        const html = await response.text();

        logTest(
            'Report page loads successfully',
            response.status === 200,
            `Status: ${response.status}`
        );

        logTest(
            'HTML contains React library',
            html.includes('react@18'),
            'React library not found'
        );

        logTest(
            'HTML contains Chart.js library',
            html.includes('chart.js'),
            'Chart.js library not found'
        );

        logTest(
            'HTML contains print styles',
            html.includes('@media print'),
            'Print styles not found'
        );

        logTest(
            'HTML contains no-print class',
            html.includes('.no-print'),
            'no-print class not found'
        );

        logTest(
            'HTML contains report page component',
            html.includes('ReportPage'),
            'ReportPage component not found'
        );

        logTest(
            'HTML contains URL parameter parsing',
            html.includes('URLSearchParams') && html.includes('window.location.search'),
            'URL parameter parsing not found'
        );

        logTest(
            'HTML contains API fetch call',
            html.includes('/api/report-get'),
            'API fetch call not found'
        );

        logTest(
            'HTML contains loading state',
            html.includes('Loading') || html.includes('loading'),
            'Loading state not found'
        );

        logTest(
            'HTML contains error handling',
            html.includes('error') && html.includes('Error'),
            'Error handling not found'
        );

        logTest(
            'HTML contains print button',
            html.includes('window.print'),
            'Print button functionality not found'
        );

    } catch (error) {
        logTest('Report page HTML validation', false, error.message);
    }
}

/**
 * Test 5: Main Assessment Page Print Styles
 */
async function testMainPagePrintStyles() {
    logSection('Test 5: Main Page Print Styles');

    try {
        const response = await fetch(`${BASE_URL}/brokerage-intelligence-platform.html`);
        const html = await response.text();

        logTest(
            'Main page loads successfully',
            response.status === 200,
            `Status: ${response.status}`
        );

        logTest(
            'Main page contains print styles',
            html.includes('@media print'),
            'Print styles not found'
        );

        logTest(
            'Main page has no-print class on header',
            html.includes('no-print') && html.includes('header'),
            'no-print class not applied to header'
        );

        logTest(
            'Main page has download PDF button',
            html.includes('Download PDF') || html.includes('📄'),
            'Download PDF button not found'
        );

        logTest(
            'Main page has share button',
            html.includes('Share Report') || html.includes('🔗'),
            'Share button not found'
        );

        logTest(
            'Main page has print-break class',
            html.includes('print-break'),
            'print-break class not found'
        );

        logTest(
            'Print styles hide no-print elements',
            html.includes('.no-print') && html.includes('display: none'),
            'no-print hide style not found'
        );

        logTest(
            'Print styles preserve colors',
            html.includes('print-color-adjust: exact') || html.includes('-webkit-print-color-adjust: exact'),
            'Color preservation not found'
        );

        logTest(
            'Print styles have page margins',
            html.includes('@page') && html.includes('margin'),
            'Page margins not defined'
        );

    } catch (error) {
        logTest('Main page print styles validation', false, error.message);
    }
}

/**
 * Test 6: Data Structure Validation
 */
async function testDataStructure(reportData) {
    logSection('Test 6: Data Structure Validation');

    if (!reportData) {
        logTest('Data structure validation (skipped)', false, 'No report data available');
        return;
    }

    // Check scores structure
    logTest(
        'Scores object has all required fields',
        reportData.scores &&
        typeof reportData.scores.overall === 'number' &&
        typeof reportData.scores.transactionOversight === 'number' &&
        typeof reportData.scores.knowledgeManagement === 'number' &&
        typeof reportData.scores.clientExperience === 'number' &&
        typeof reportData.scores.riskManagement === 'number' &&
        typeof reportData.scores.riskLevel === 'string' &&
        typeof reportData.scores.percentile === 'string',
        'Missing required score fields'
    );

    // Check score ranges
    logTest(
        'Overall score in valid range (0-100)',
        reportData.scores?.overall >= 0 && reportData.scores?.overall <= 100,
        `Score: ${reportData.scores?.overall}`
    );

    logTest(
        'Category scores in valid range (0-35)',
        reportData.scores?.transactionOversight >= 0 && reportData.scores?.transactionOversight <= 35 &&
        reportData.scores?.knowledgeManagement >= 0 && reportData.scores?.knowledgeManagement <= 35 &&
        reportData.scores?.clientExperience >= 0 && reportData.scores?.clientExperience <= 35 &&
        reportData.scores?.riskManagement >= 0 && reportData.scores?.riskManagement <= 35,
        'Category score out of range'
    );

    // Check risk level
    const validRiskLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
    logTest(
        'Risk level is valid',
        validRiskLevels.includes(reportData.scores?.riskLevel),
        `Risk level: ${reportData.scores?.riskLevel}`
    );

    // Check company info
    logTest(
        'Company info has required fields',
        reportData.companyInfo &&
        typeof reportData.companyInfo.company_name === 'string' &&
        typeof reportData.companyInfo.agent_count === 'string' &&
        typeof reportData.companyInfo.monthly_deals === 'string' &&
        typeof reportData.companyInfo.location === 'string',
        'Missing company info fields'
    );

    // Check timestamp
    logTest(
        'Timestamp is valid ISO string',
        reportData.timestamp && !isNaN(Date.parse(reportData.timestamp)),
        `Timestamp: ${reportData.timestamp}`
    );
}

/**
 * Test 7: URL Parameter Handling
 */
function testURLParameterHandling() {
    logSection('Test 7: URL Parameter Logic');

    // Simulate URL parameter parsing
    const testCases = [
        { url: '?id=123e4567-e89b-12d3-a456-426614174000', expected: '123e4567-e89b-12d3-a456-426614174000' },
        { url: '?id=invalid', expected: 'invalid' },
        { url: '', expected: null },
        { url: '?other=param', expected: null },
    ];

    testCases.forEach(testCase => {
        const params = new URLSearchParams(testCase.url);
        const id = params.get('id');

        logTest(
            `URL parameter parsing for "${testCase.url}"`,
            id === testCase.expected,
            `Expected: ${testCase.expected}, Got: ${id}`
        );
    });
}

/**
 * Main test runner
 */
async function runTests() {
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}  Phase 5 Test Suite - Report Generation & PDF Functionality${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.yellow}Base URL: ${BASE_URL}${colors.reset}\n`);

    // Run all tests
    const assessmentId = await testAssessmentSubmission();
    const reportData = await testReportRetrieval(assessmentId);
    await testInvalidAssessmentId();
    await testReportPageHTML();
    await testMainPagePrintStyles();
    testDataStructure(reportData);
    testURLParameterHandling();

    // Print summary
    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.cyan}  Test Summary${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    const passRateColor = passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red;

    console.log(`Total Tests:  ${testResults.total}`);
    console.log(`${colors.green}Passed:       ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}Failed:       ${testResults.failed}${colors.reset}`);
    console.log(`${passRateColor}Pass Rate:    ${passRate}%${colors.reset}\n`);

    if (testResults.failed === 0) {
        console.log(`${colors.green}✓ All tests passed! Phase 5 is working correctly.${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.red}✗ Some tests failed. Please review the errors above.${colors.reset}\n`);
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    console.error(`\n${colors.red}Test suite error: ${error.message}${colors.reset}\n`);
    process.exit(1);
});
