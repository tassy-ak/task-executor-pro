-- Add AI analysis column to threats table
ALTER TABLE threats ADD COLUMN ai_analysis TEXT;
ALTER TABLE threats ADD COLUMN ai_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance
CREATE INDEX idx_threats_ai_analyzed ON threats(ai_analyzed_at) WHERE ai_analysis IS NOT NULL;