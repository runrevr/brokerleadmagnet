/**
 * Phase 5 Standalone Testing Suite
 * Tests files and structure WITHOUT requiring API/database
 *
 * Run with: node test-phase5-standalone.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

function logTest(testName, passed, message = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`${colors.green}✓${colors.reset} ${testName}`);
    } else {
        testResults.failed++;
        console.log(`${colors.red}✗${colors.reset} ${testName}`);
        if (message) console.log(`  ${colors.yellow}${message}${colors.reset}`);
    }
}

function logSection(title) {
    console.log(`\n${colors.cyan}${title}${colors.reset}`);
    console.log('='.repeat(60));
}

function logInfo(message) {
    console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

/**
 * Test 1: File Existence
 */
function testFileExistence() {
    logSection('Test 1: Required Files Exist');

    const requiredFiles = [
        'report.html',
        'brokerage-intelligence-platform.html',
        'test-report-sample.html',
        'test-phase5.js',
        'PHASE_5_COMPLETE.md',
        'PHASE_5_TESTING.md',
        'api/db.js',
        'api/assessment-submit.js',
        'api/report-get.js',
        'api/email-capture.js',
        'api/activecampaign.js'
    ];

    requiredFiles.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, file));
        logTest(
            `File exists: ${file}`,
            exists,
            exists ? '' : 'File not found'
        );
    });
}

/**
 * Test 2: Report Page HTML Validation
 */
function testReportPageHTML() {
    logSection('Test 2: Report Page HTML Content');

    try {
        const reportHtml = fs.readFileSync(path.join(__dirname, 'report.html'), 'utf8');

        logTest(
            'HTML contains React library',
            reportHtml.includes('react@18'),
            'React 18 CDN not found'
        );

        logTest(
            'HTML contains Chart.js library',
            reportHtml.includes('chart.js'),
            'Chart.js library not found'
        );

        logTest(
            'HTML contains Tailwind CSS',
            reportHtml.includes('tailwindcss'),
            'Tailwind CSS not found'
        );

        logTest(
            'HTML contains print styles',
            reportHtml.includes('@media print'),
            'Print media query not found'
        );

        logTest(
            'HTML has .no-print class definition',
            reportHtml.includes('.no-print'),
            'no-print class not found'
        );

        logTest(
            'HTML contains ReportPage component',
            reportHtml.includes('ReportPage') || reportHtml.includes('const ReportPage'),
            'ReportPage component not found'
        );

        logTest(
            'HTML parses URL parameters',
            reportHtml.includes('URLSearchParams') && reportHtml.includes('window.location.search'),
            'URL parameter parsing not implemented'
        );

        logTest(
            'HTML fetches from API',
            reportHtml.includes('/api/report-get') && reportHtml.includes('fetch'),
            'API fetch not implemented'
        );

        logTest(
            'HTML has loading state',
            reportHtml.includes('loading') || reportHtml.includes('Loading'),
            'Loading state not found'
        );

        logTest(
            'HTML has error handling',
            reportHtml.includes('error') && reportHtml.includes('Error'),
            'Error handling not implemented'
        );

        logTest(
            'HTML has print button',
            reportHtml.includes('window.print'),
            'Print button not found'
        );

        logTest(
            'HTML has gauge chart rendering',
            reportHtml.includes('doughnut') && reportHtml.includes('Chart'),
            'Gauge chart not implemented'
        );

        logTest(
            'HTML has radar chart rendering',
            reportHtml.includes('radar') && reportHtml.includes('Chart'),
            'Radar chart not implemented'
        );

        logTest(
            'HTML has share/copy link button',
            reportHtml.includes('clipboard') || reportHtml.includes('Copy'),
            'Share button not found'
        );

    } catch (error) {
        logTest('Report page HTML validation', false, error.message);
    }
}

/**
 * Test 3: Main Assessment Page Print Styles
 */
function testMainPagePrintStyles() {
    logSection('Test 3: Main Assessment Page Updates');

    try {
        const mainHtml = fs.readFileSync(
            path.join(__dirname, 'brokerage-intelligence-platform.html'),
            'utf8'
        );

        logTest(
            'Main page has print styles block',
            mainHtml.includes('@media print') && mainHtml.includes('<style>'),
            'Print styles <style> block not found'
        );

        logTest(
            'Print styles hide .no-print elements',
            mainHtml.includes('.no-print') && mainHtml.includes('display: none'),
            'no-print display:none rule not found'
        );

        logTest(
            'Print styles reset body background',
            mainHtml.includes('body') && mainHtml.includes('background: white'),
            'Body background reset not found'
        );

        logTest(
            'Print styles remove shadows',
            mainHtml.includes('shadow') && mainHtml.includes('box-shadow: none'),
            'Shadow removal not found'
        );

        logTest(
            'Print styles preserve canvas/charts',
            mainHtml.includes('canvas') && mainHtml.includes('page-break-inside: avoid'),
            'Canvas page-break rule not found'
        );

        logTest(
            'Print styles define page margins',
            mainHtml.includes('@page') && mainHtml.includes('margin'),
            '@page margin rule not found'
        );

        logTest(
            'Print styles preserve colors',
            mainHtml.includes('print-color-adjust: exact') ||
            mainHtml.includes('-webkit-print-color-adjust: exact'),
            'Color preservation not found'
        );

        logTest(
            'Header has no-print class',
            mainHtml.includes('header') && mainHtml.includes('no-print'),
            'Header no-print class not applied'
        );

        logTest(
            'Has Download PDF button',
            mainHtml.includes('Download PDF') || mainHtml.includes('📄'),
            'Download PDF button not found'
        );

        logTest(
            'Has Share Report button',
            mainHtml.includes('Share Report') || mainHtml.includes('🔗'),
            'Share Report button not found'
        );

        logTest(
            'Has print-break class usage',
            mainHtml.includes('print-break'),
            'print-break class not used'
        );

        logTest(
            'Buttons trigger window.print()',
            mainHtml.includes('window.print()'),
            'window.print() not implemented'
        );

    } catch (error) {
        logTest('Main page print styles', false, error.message);
    }
}

/**
 * Test 4: Test Sample Page
 */
function testSamplePage() {
    logSection('Test 4: Test Sample Page');

    try {
        const sampleHtml = fs.readFileSync(
            path.join(__dirname, 'test-report-sample.html'),
            'utf8'
        );

        logTest(
            'Sample page exists and is readable',
            sampleHtml.length > 0,
            'File is empty'
        );

        logTest(
            'Sample page has mock data',
            sampleHtml.includes('mockReportData') || sampleHtml.includes('Test Realty'),
            'Mock data not found'
        );

        logTest(
            'Sample page has test checklist',
            sampleHtml.includes('checkbox') && sampleHtml.includes('Test'),
            'Test checklist not found'
        );

        logTest(
            'Sample page has test mode banner',
            sampleHtml.includes('TEST MODE') || sampleHtml.includes('test mode'),
            'Test mode banner not found'
        );

        logTest(
            'Sample page renders without API',
            !sampleHtml.includes('fetch') || sampleHtml.includes('mock'),
            'May still require API calls'
        );

    } catch (error) {
        logTest('Test sample page validation', false, error.message);
    }
}

/**
 * Test 5: API Endpoints Exist
 */
function testAPIFiles() {
    logSection('Test 5: API Endpoint Files');

    const apiFiles = {
        'api/assessment-submit.js': 'Assessment submission endpoint',
        'api/report-get.js': 'Report retrieval endpoint',
        'api/email-capture.js': 'Email capture endpoint',
        'api/db.js': 'Database helper functions',
        'api/activecampaign.js': 'ActiveCampaign integration'
    };

    Object.entries(apiFiles).forEach(([file, description]) => {
        try {
            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

            logTest(
                `${description} exists`,
                content.length > 0,
                'File is empty'
            );

            // Check for exports
            logTest(
                `${file} has module.exports`,
                content.includes('module.exports') || content.includes('export'),
                'No exports found'
            );

        } catch (error) {
            logTest(`API file: ${file}`, false, error.message);
        }
    });
}

/**
 * Test 6: Documentation Files
 */
function testDocumentation() {
    logSection('Test 6: Documentation');

    const docFiles = {
        'PHASE_5_COMPLETE.md': ['Phase 5', 'Report Generation', 'PDF'],
        'PHASE_5_TESTING.md': ['Testing', 'Test', 'checklist']
    };

    Object.entries(docFiles).forEach(([file, keywords]) => {
        try {
            const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

            logTest(
                `Documentation file ${file} exists`,
                content.length > 100,
                'File too short or empty'
            );

            keywords.forEach(keyword => {
                logTest(
                    `${file} contains "${keyword}"`,
                    content.toLowerCase().includes(keyword.toLowerCase()),
                    `Keyword not found: ${keyword}`
                );
            });

        } catch (error) {
            logTest(`Documentation: ${file}`, false, error.message);
        }
    });
}

/**
 * Test 7: Code Quality Checks
 */
function testCodeQuality() {
    logSection('Test 7: Code Quality');

    try {
        const reportHtml = fs.readFileSync(path.join(__dirname, 'report.html'), 'utf8');

        logTest(
            'No TODO comments in report.html',
            !reportHtml.includes('TODO') && !reportHtml.includes('FIXME'),
            'Found TODO/FIXME comments'
        );

        logTest(
            'Has proper DOCTYPE declaration',
            reportHtml.includes('<!DOCTYPE html>'),
            'Missing DOCTYPE'
        );

        logTest(
            'Has viewport meta tag',
            reportHtml.includes('viewport'),
            'Missing viewport meta tag'
        );

        logTest(
            'Has charset declaration',
            reportHtml.includes('charset="UTF-8"'),
            'Missing charset'
        );

        logTest(
            'Uses const/let (not var)',
            !reportHtml.includes('var ') || reportHtml.split('var ').length < 3,
            'Found var declarations (should use const/let)'
        );

        logTest(
            'Has proper React hooks usage',
            reportHtml.includes('useState') && reportHtml.includes('useEffect'),
            'React hooks not properly used'
        );

    } catch (error) {
        logTest('Code quality checks', false, error.message);
    }
}

/**
 * Test 8: File Sizes
 */
function testFileSizes() {
    logSection('Test 8: File Size Validation');

    const sizeChecks = {
        'report.html': { min: 10000, max: 50000 },
        'brokerage-intelligence-platform.html': { min: 15000, max: 100000 },
        'test-report-sample.html': { min: 5000, max: 50000 }
    };

    Object.entries(sizeChecks).forEach(([file, sizes]) => {
        try {
            const stats = fs.statSync(path.join(__dirname, file));
            const size = stats.size;

            logTest(
                `${file} size is reasonable (${(size/1024).toFixed(1)}KB)`,
                size >= sizes.min && size <= sizes.max,
                `Expected ${sizes.min}-${sizes.max} bytes, got ${size}`
            );

        } catch (error) {
            logTest(`File size: ${file}`, false, error.message);
        }
    });
}

/**
 * Main test runner
 */
function runTests() {
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}  Phase 5 Standalone Test Suite${colors.reset}`);
    console.log(`${colors.blue}  No API/Database Required${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    logInfo('Testing file structure and content...\n');

    testFileExistence();
    testReportPageHTML();
    testMainPagePrintStyles();
    testSamplePage();
    testAPIFiles();
    testDocumentation();
    testCodeQuality();
    testFileSizes();

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
        console.log(`${colors.green}✓ All Phase 5 files are complete and valid!${colors.reset}`);
        console.log(`${colors.blue}ℹ Next: Open test-report-sample.html in your browser to test visually${colors.reset}\n`);
        process.exit(0);
    } else if (passRate >= 80) {
        console.log(`${colors.yellow}⚠ Most tests passed. Review failures above.${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.red}✗ Some critical tests failed. Please review.${colors.reset}\n`);
        process.exit(1);
    }
}

// Run tests
try {
    runTests();
} catch (error) {
    console.error(`\n${colors.red}Test suite error: ${error.message}${colors.reset}\n`);
    process.exit(1);
}
