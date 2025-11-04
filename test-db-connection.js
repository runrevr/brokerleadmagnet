/**
 * Database Connection Test Script
 * Run this to verify Supabase setup is working correctly
 *
 * Usage: node test-db-connection.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Color output for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n🧪 Testing Supabase Database Connection...\n', 'blue');

  // Step 1: Check environment variables
  log('1. Checking environment variables...', 'yellow');

  if (!process.env.SUPABASE_URL) {
    log('   ❌ SUPABASE_URL not found in .env', 'red');
    return false;
  }
  log(`   ✅ SUPABASE_URL: ${process.env.SUPABASE_URL}`, 'green');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('   ❌ SUPABASE_SERVICE_ROLE_KEY not found in .env', 'red');
    return false;
  }
  log('   ✅ SUPABASE_SERVICE_ROLE_KEY: Found', 'green');

  // Step 2: Initialize client
  log('\n2. Initializing Supabase client...', 'yellow');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  log('   ✅ Client initialized', 'green');

  // Step 3: Check if tables exist
  log('\n3. Checking if database tables exist...', 'yellow');

  const tables = ['assessments', 'scores', 'responses', 'gaps'];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        log(`   ❌ Table '${table}' not found or not accessible`, 'red');
        log(`      Error: ${error.message}`, 'red');
        allTablesExist = false;
      } else {
        log(`   ✅ Table '${table}' exists and accessible`, 'green');
      }
    } catch (err) {
      log(`   ❌ Error checking table '${table}': ${err.message}`, 'red');
      allTablesExist = false;
    }
  }

  if (!allTablesExist) {
    log('\n⚠️  Some tables are missing!', 'yellow');
    log('   Please run the SQL schema in Supabase SQL Editor:', 'yellow');
    log('   File: supabase-schema.sql\n', 'yellow');
    return false;
  }

  // Step 4: Test insert operation (sample assessment)
  log('\n4. Testing INSERT operation (creating sample assessment)...', 'yellow');

  try {
    const { data: assessment, error: insertError } = await supabase
      .from('assessments')
      .insert([{
        company_name: 'Test Brokerage Inc.',
        company_size: '11-25',
        monthly_transactions: '10-20',
        primary_market: 'Test City',
        overall_score: 75.5,
        risk_level: 'MODERATE',
        percentile: 60
      }])
      .select()
      .single();

    if (insertError) {
      log(`   ❌ Insert failed: ${insertError.message}`, 'red');
      return false;
    }

    log(`   ✅ Assessment created with ID: ${assessment.id}`, 'green');

    // Step 5: Test SELECT operation
    log('\n5. Testing SELECT operation (retrieving assessment)...', 'yellow');

    const { data: retrieved, error: selectError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessment.id)
      .single();

    if (selectError) {
      log(`   ❌ Select failed: ${selectError.message}`, 'red');
      return false;
    }

    log(`   ✅ Retrieved: ${retrieved.company_name}`, 'green');

    // Step 6: Test related tables (scores)
    log('\n6. Testing related table INSERT (scores)...', 'yellow');

    const { error: scoresError } = await supabase
      .from('scores')
      .insert([{
        assessment_id: assessment.id,
        category: 'Transaction Oversight',
        score: 25,
        max_score: 35,
        percentage: 71.43
      }]);

    if (scoresError) {
      log(`   ❌ Scores insert failed: ${scoresError.message}`, 'red');
      return false;
    }

    log('   ✅ Score record created', 'green');

    // Step 7: Test JOIN query
    log('\n7. Testing JOIN query (assessment with scores)...', 'yellow');

    const { data: fullAssessment, error: joinError } = await supabase
      .from('assessments')
      .select(`
        *,
        scores(*)
      `)
      .eq('id', assessment.id)
      .single();

    if (joinError) {
      log(`   ❌ Join query failed: ${joinError.message}`, 'red');
      return false;
    }

    log(`   ✅ Retrieved assessment with ${fullAssessment.scores.length} score(s)`, 'green');

    // Step 8: Clean up test data
    log('\n8. Cleaning up test data...', 'yellow');

    const { error: deleteError } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessment.id);

    if (deleteError) {
      log(`   ⚠️  Cleanup failed: ${deleteError.message}`, 'yellow');
      log(`   Note: Test data remains in database (ID: ${assessment.id})`, 'yellow');
    } else {
      log('   ✅ Test data deleted (cascade deleted related records)', 'green');
    }

    return true;

  } catch (err) {
    log(`   ❌ Unexpected error: ${err.message}`, 'red');
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      log('\n✅ SUCCESS! Database is fully configured and working!', 'green');
      log('   You can now proceed to Phase 3: API Development\n', 'blue');
      process.exit(0);
    } else {
      log('\n❌ FAILED! Please fix the issues above and try again.', 'red');
      log('   Refer to BUILD_PLAN.md Phase 2 for setup instructions.\n', 'yellow');
      process.exit(1);
    }
  })
  .catch(err => {
    log(`\n❌ Fatal error: ${err.message}`, 'red');
    process.exit(1);
  });
