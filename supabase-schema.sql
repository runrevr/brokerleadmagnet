-- ============================================
-- Brokerage Intelligence Platform - Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- 1. ASSESSMENTS TABLE
-- Main table storing assessment overview and company info
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  monthly_transactions TEXT NOT NULL,
  primary_market TEXT NOT NULL,
  overall_score DECIMAL(5,2) NOT NULL,
  risk_level TEXT NOT NULL,
  percentile INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. SCORES TABLE
-- Category-level scores breakdown
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL
);

-- 3. RESPONSES TABLE
-- Individual question responses
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  points_earned INTEGER NOT NULL
);

-- 4. GAPS TABLE
-- Identified weaknesses/improvement areas
CREATE TABLE IF NOT EXISTS gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  issue TEXT NOT NULL,
  severity TEXT NOT NULL,
  impact TEXT NOT NULL
);

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_assessments_email ON assessments(email);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_risk_level ON assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_scores_assessment ON scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_assessment ON responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_gaps_assessment ON gaps(assessment_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Service role can do everything on assessments" ON assessments;
DROP POLICY IF EXISTS "Service role can do everything on scores" ON scores;
DROP POLICY IF EXISTS "Service role can do everything on responses" ON responses;
DROP POLICY IF EXISTS "Service role can do everything on gaps" ON gaps;

-- Create policies: Allow service role full access (for API backend)
CREATE POLICY "Service role can do everything on assessments" ON assessments
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on scores" ON scores
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on responses" ON responses
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on gaps" ON gaps
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTIONS (Optional but useful)
-- ============================================

-- Function to calculate average score (for statistics)
CREATE OR REPLACE FUNCTION avg_overall_score()
RETURNS DECIMAL AS $$
BEGIN
  RETURN (SELECT AVG(overall_score) FROM assessments);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after schema creation to verify setup:

-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('assessments', 'scores', 'responses', 'gaps');

-- Check indexes exist
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('assessments', 'scores', 'responses', 'gaps');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('assessments', 'scores', 'responses', 'gaps');

-- ============================================
-- DONE! Your database is ready.
-- Next: Test connection with the test script
-- ============================================
