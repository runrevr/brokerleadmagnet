-- Migration: Add assessment_type column to support both brokerage and agent assessments
-- Date: 2025-11-10

-- Add assessment_type column to assessments table
ALTER TABLE assessments
ADD COLUMN assessment_type VARCHAR(20) DEFAULT 'brokerage' NOT NULL;

-- Create index for faster queries filtered by type
CREATE INDEX idx_assessments_type ON assessments(assessment_type);

-- Create index for token lookups by type
CREATE INDEX idx_assessments_token_type ON assessments(shareable_token, assessment_type);

-- Add check constraint to ensure only valid types
ALTER TABLE assessments
ADD CONSTRAINT chk_assessment_type CHECK (assessment_type IN ('brokerage', 'agent'));

-- Update existing records to be 'brokerage' type (already defaulted, but explicit)
UPDATE assessments SET assessment_type = 'brokerage' WHERE assessment_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN assessments.assessment_type IS 'Type of assessment: brokerage or agent';
