import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GameMode } from '@/components/games/GameRouter';

interface MatchmakingState {
  isQueued: boolean;
  isMatched: boolean;
  gameId: string | null;
  opponent: {
    id: string;
    username: string;
  } | null;
  estimatedWaitTime: number;
}

export const useMatchmaking = () => {
  const { user } = useAuth();
  const [state, setState] = useState<MatchmakingState>({
    isQueued: false,
    isMatched: false,
    gameId: null,
    opponent: null,
    estimatedWaitTime: 30,
  });

  // Join matchmaking queue
  const joinQueue = useCallback(async (gameMode: GameMode) => {
    if (!user) return;

    try {
      // First, clean up any existing queue entries for this user
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('player_id', user.id);

      // Add to queue
      const { error } = await supabase
        .from('matchmaking_queue')
        .insert({
          player_id: user.id,
          game_mode: gameMode,
          skill_level: 1, // Could be calculated based on user's rank/exp
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isQueued: true,
        isMatched: false,
        gameId: null,
        opponent: null,
      }));

      // Start monitoring for matches
      monitorForMatches();

    } catch (error) {
      console.error('Error joining queue:', error);
      throw error;
    }
  }, [user]);

  // Leave matchmaking queue
  const leaveQueue = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('player_id', user.id);

      setState(prev => ({
        ...prev,
        isQueued: false,
        isMatched: false,
        gameId: null,
        opponent: null,
      }));

    } catch (error) {
      console.error('Error leaving queue:', error);
      throw error;
    }
  }, [user]);

  // Monitor for matches using real-time subscriptions
  const monitorForMatches = useCallback(() => {
    if (!user) return;

    const subscription = supabase
      .channel('active_games')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'active_games',
          filter: `player1_id=eq.${user.id},player2_id=eq.${user.id}`,
        },
        async (payload) => {
          const game = payload.new;
          
          // Determine opponent
          const opponentId = game.player1_id === user.id ? game.player2_id : game.player1_id;
          
          // Fetch opponent profile
          const { data: opponentProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', opponentId)
            .single();

          setState(prev => ({
            ...prev,
            isQueued: false,
            isMatched: true,
            gameId: game.id,
            opponent: {
              id: opponentId,
              username: opponentProfile?.username || 'Unknown Player',
            },
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Simulate matchmaking for development (since we don't have multiple real users)
  const simulateMatch = useCallback(async (gameMode: GameMode) => {
    if (!user) return;

    setState(prev => ({ ...prev, isQueued: true }));

    // Simulate finding a match after 2-4 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isQueued: false,
        isMatched: true,
        gameId: 'simulated-game-' + Date.now(),
        opponent: {
          id: 'ai-opponent',
          username: 'AI Player',
        },
      }));
    }, Math.random() * 2000 + 2000);
  }, [user]);

  // Reset state when user changes
  useEffect(() => {
    if (!user) {
      setState({
        isQueued: false,
        isMatched: false,
        gameId: null,
        opponent: null,
        estimatedWaitTime: 30,
      });
    }
  }, [user]);

  // Clean up subscriptions on unmount
  useEffect(() => {
    return () => {
      if (state.isQueued) {
        leaveQueue();
      }
    };
  }, []);

  return {
    ...state,
    joinQueue,
    leaveQueue,
    simulateMatch, // For development
  };
};