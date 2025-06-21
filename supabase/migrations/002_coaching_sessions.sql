-- Coaching sessions table
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  coaching_advice TEXT NOT NULL,
  battles_analyzed INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for performance
CREATE INDEX coaching_sessions_user_id_created_at_idx ON coaching_sessions(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own coaching sessions" ON coaching_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coaching sessions" ON coaching_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);