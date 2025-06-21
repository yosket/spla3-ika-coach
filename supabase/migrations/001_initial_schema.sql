-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Encrypted tokens table
CREATE TABLE encrypted_tokens (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  encrypted_data TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Battles table
CREATE TABLE battles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  battle_data JSONB NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Indexes for performance
  CONSTRAINT battles_user_id_id_unique UNIQUE (user_id, id)
);

-- AI analyses table
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  result JSONB NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Foreign key to battles
  FOREIGN KEY (user_id, battle_id) REFERENCES battles(user_id, id) ON DELETE CASCADE
);

-- User statistics cache table
CREATE TABLE user_stats_cache (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  stats_data JSONB NOT NULL,
  last_battle_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX battles_user_id_played_at_idx ON battles(user_id, played_at DESC);
CREATE INDEX battles_played_at_idx ON battles(played_at DESC);
CREATE INDEX ai_analyses_battle_id_idx ON ai_analyses(battle_id);
CREATE INDEX ai_analyses_user_id_created_at_idx ON ai_analyses(user_id, created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only manage their own tokens
CREATE POLICY "Users can view own tokens" ON encrypted_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON encrypted_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON encrypted_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON encrypted_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own battles
CREATE POLICY "Users can view own battles" ON battles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own battles" ON battles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own analyses
CREATE POLICY "Users can view own analyses" ON ai_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON ai_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own stats
CREATE POLICY "Users can view own stats" ON user_stats_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats_cache
  FOR ALL USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encrypted_tokens_updated_at BEFORE UPDATE ON encrypted_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_cache_updated_at BEFORE UPDATE ON user_stats_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();