-- Study Break Timer Database Schema & Row Level Security (RLS)

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  contact_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_title TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'break')),
  planned_duration_seconds INTEGER NOT NULL CHECK (planned_duration_seconds > 0),
  actual_duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (actual_duration_seconds >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_status_type ON public.study_sessions(user_id, status, session_type);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(user_id, started_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Profiles RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Study Sessions RLS Policies
-- Users can view their own sessions
CREATE POLICY "Users can view own study sessions" 
ON public.study_sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create own study sessions" 
ON public.study_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own study sessions" 
ON public.study_sessions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own study sessions" 
ON public.study_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Trigger to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Trigger to update updated_at on profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
