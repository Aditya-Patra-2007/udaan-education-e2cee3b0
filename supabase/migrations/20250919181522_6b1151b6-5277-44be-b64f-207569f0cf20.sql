-- Create users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT DEFAULT '/placeholder.svg',
  exp INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create matches table for PvP battles
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  player1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('comprehension', 'spellbee')),
  exp_gained INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Matches policies  
CREATE POLICY "Users can view matches they participated in" ON public.matches FOR SELECT USING (
  auth.uid() = player1_id OR auth.uid() = player2_id
);
CREATE POLICY "Users can create matches" ON public.matches FOR INSERT WITH CHECK (
  auth.uid() = player1_id OR auth.uid() = player2_id
);
CREATE POLICY "Users can update matches they're in" ON public.matches FOR UPDATE USING (
  auth.uid() = player1_id OR auth.uid() = player2_id
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update user rank based on EXP
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple ranking system: rank = exp / 100 + 1
  NEW.rank = GREATEST(1, NEW.exp / 100 + 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update rank when EXP changes
CREATE TRIGGER update_rank_on_exp_change
  BEFORE UPDATE OF exp ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_rank();