-- Add matchmaking queue table
CREATE TABLE public.matchmaking_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('comprehension', 'spellbee')),
  skill_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Add active games table for real-time games
CREATE TABLE public.active_games (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  player1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('comprehension', 'spellbee')),
  game_state JSONB DEFAULT '{}',
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS for new tables
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_games ENABLE ROW LEVEL SECURITY;

-- Matchmaking queue policies
CREATE POLICY "Users can view own queue entries" ON public.matchmaking_queue FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Users can insert own queue entries" ON public.matchmaking_queue FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Users can delete own queue entries" ON public.matchmaking_queue FOR DELETE USING (auth.uid() = player_id);

-- Active games policies
CREATE POLICY "Users can view games they're in" ON public.active_games FOR SELECT USING (
  auth.uid() = player1_id OR auth.uid() = player2_id
);
CREATE POLICY "Users can update games they're in" ON public.active_games FOR UPDATE USING (
  auth.uid() = player1_id OR auth.uid() = player2_id
);

-- Function to clean up old queue entries (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_matchmaking_queue()
RETURNS void AS $$
BEGIN
  DELETE FROM public.matchmaking_queue 
  WHERE created_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to match players in queue
CREATE OR REPLACE FUNCTION public.match_players()
RETURNS void AS $$
DECLARE
  player1_record RECORD;
  player2_record RECORD;
  game_id UUID;
BEGIN
  -- Find pairs of players in the same game mode
  FOR player1_record IN 
    SELECT * FROM public.matchmaking_queue 
    ORDER BY created_at ASC
  LOOP
    -- Find a suitable opponent
    SELECT * INTO player2_record
    FROM public.matchmaking_queue 
    WHERE id != player1_record.id 
      AND game_mode = player1_record.game_mode
      AND ABS(skill_level - player1_record.skill_level) <= 2
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF player2_record.id IS NOT NULL THEN
      -- Create a new game
      INSERT INTO public.active_games (player1_id, player2_id, game_mode)
      VALUES (player1_record.player_id, player2_record.player_id, player1_record.game_mode)
      RETURNING id INTO game_id;
      
      -- Remove both players from queue
      DELETE FROM public.matchmaking_queue 
      WHERE id IN (player1_record.id, player2_record.id);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update timestamps on active games
CREATE TRIGGER update_active_games_updated_at
  BEFORE UPDATE ON public.active_games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();