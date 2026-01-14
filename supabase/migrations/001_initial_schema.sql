-- =====================================================
-- RUNNERS TABLE (profiles)
-- =====================================================
CREATE TABLE public.runners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.runners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for runners
CREATE POLICY "Users can view own runner profile"
  ON public.runners
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own runner profile"
  ON public.runners
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own runner profile"
  ON public.runners
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create runner profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.runners (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- RUNNER_RESPONSES TABLE
-- =====================================================
CREATE TABLE public.runner_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.runners(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,

  -- Ensure one response per user (can be updated via upsert)
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.runner_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for runner_responses
CREATE POLICY "Users can view own responses"
  ON public.runner_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses"
  ON public.runner_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses"
  ON public.runner_responses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own responses"
  ON public.runner_responses
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_runners_updated_at
  BEFORE UPDATE ON public.runners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_runner_responses_updated_at
  BEFORE UPDATE ON public.runner_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_runner_responses_user_id ON public.runner_responses(user_id);
CREATE INDEX idx_runners_onboarding_completed ON public.runners(onboarding_completed);
