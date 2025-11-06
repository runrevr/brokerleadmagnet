-- Migration: Add shareable token and AI content storage to assessments table
-- Created: 2025-11-05
-- Purpose: Enable shareable report links with 2-day expiration and store AI-generated content

-- Add columns to assessments table
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS shareable_token UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS ai_executive_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_full_analysis JSONB;

-- Create index for faster shareable token lookups
CREATE INDEX IF NOT EXISTS idx_shareable_token ON assessments(shareable_token);

-- Create index for token expiration queries
CREATE INDEX IF NOT EXISTS idx_token_expires_at ON assessments(token_expires_at);

-- Update existing rows to set token_expires_at based on created_at + 2 days
UPDATE assessments
SET token_expires_at = created_at + INTERVAL '2 days'
WHERE token_expires_at IS NULL AND created_at IS NOT NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN assessments.shareable_token IS 'Unique UUID for shareable report links';
COMMENT ON COLUMN assessments.token_expires_at IS 'Expiration timestamp for shareable link (created_at + 2 days)';
COMMENT ON COLUMN assessments.ai_executive_summary IS 'AI-generated executive summary (pre-email gate content)';
COMMENT ON COLUMN assessments.ai_full_analysis IS 'AI-generated full analysis JSON (post-email gate content)';

-- Create function to automatically set token_expires_at on insert
CREATE OR REPLACE FUNCTION set_token_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token_expires_at IS NULL AND NEW.created_at IS NOT NULL THEN
    NEW.token_expires_at := NEW.created_at + INTERVAL '2 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set token expiration
DROP TRIGGER IF EXISTS trigger_set_token_expiration ON assessments;
CREATE TRIGGER trigger_set_token_expiration
  BEFORE INSERT ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION set_token_expiration();

-- Verify migration
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'assessments'
AND column_name IN ('shareable_token', 'token_expires_at', 'ai_executive_summary', 'ai_full_analysis');
