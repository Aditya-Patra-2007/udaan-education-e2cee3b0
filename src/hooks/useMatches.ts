import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { GameMode } from '@/components/games/GameRouter';

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
  match_type: string;
  exp_gained: number;
  created_at: string;
  player1_profile?: {
    username: string;
    avatar: string;
  };
  player2_profile?: {
    username: string;
    avatar: string;
  };
}

export interface MatchResult {
  matchId: string;
  score: number;
  totalQuestions: number;
  gameMode: GameMode;
  opponentId: string;
  won: boolean;
}

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    matchesWon: 0,
    winRate: 0,
    totalExpGained: 0,
  });

  // Fetch user's match history
  const fetchMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profile data for matches
      if (matchesData && matchesData.length > 0) {
        const playerIds = new Set<string>();
        matchesData.forEach(match => {
          playerIds.add(match.player1_id);
          playerIds.add(match.player2_id);
        });

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar')
          .in('id', Array.from(playerIds));

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const enrichedMatches = matchesData.map(match => ({
          ...match,
          player1_profile: {
            username: profilesMap.get(match.player1_id)?.username || 'Unknown',
            avatar: profilesMap.get(match.player1_id)?.avatar || '/placeholder.svg'
          },
          player2_profile: {
            username: profilesMap.get(match.player2_id)?.username || 'Unknown', 
            avatar: profilesMap.get(match.player2_id)?.avatar || '/placeholder.svg'
          }
        }));

        setMatches(enrichedMatches);
        calculateStats(enrichedMatches);
      } else {
        setMatches([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate user statistics
  const calculateStats = (matchData: Match[]) => {
    if (!user || !matchData.length) {
      setStats({
        totalMatches: 0,
        matchesWon: 0,
        winRate: 0,
        totalExpGained: 0,
      });
      return;
    }

    const totalMatches = matchData.length;
    const matchesWon = matchData.filter(match => match.winner_id === user.id).length;
    const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
    const totalExpGained = matchData.reduce((total, match) => {
      // Only count EXP if user was in the match
      if (match.player1_id === user.id || match.player2_id === user.id) {
        return total + (match.exp_gained || 0);
      }
      return total;
    }, 0);

    setStats({
      totalMatches,
      matchesWon,
      winRate,
      totalExpGained,
    });
  };

  // Record a new match result
  const recordMatch = async (result: MatchResult): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          player1_id: user.id,
          player2_id: result.opponentId,
          winner_id: result.won ? user.id : result.opponentId,
          match_type: result.gameMode,
          exp_gained: calculateExpGained(result.score, result.totalQuestions, result.gameMode),
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh matches after recording
      await fetchMatches();

      return data.id;
    } catch (error) {
      console.error('Error recording match:', error);
      throw error;
    }
  };

  // Update user's EXP after a match
  const updateUserExp = async (expGained: number) => {
    if (!user) return;

    try {
      // First get current exp
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('exp')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newExp = (profile?.exp || 0) + expGained;

      const { error } = await supabase
        .from('profiles')
        .update({ exp: newExp })
        .eq('id', user.id);

      if (error) throw error;

      return newExp;
    } catch (error) {
      console.error('Error updating user EXP:', error);
      throw error;
    }
  };

  // Helper function to calculate EXP gained
  const calculateExpGained = (score: number, total: number, gameMode: GameMode): number => {
    const baseExp = gameMode === 'comprehension' ? 10 : 15;
    const maxBonus = gameMode === 'comprehension' ? 15 : 15;
    const percentage = score / total;
    
    return Math.round(baseExp + (maxBonus * percentage));
  };

  // Get opponent info for a match
  const getOpponentInfo = (match: Match) => {
    if (!user) return null;

    if (match.player1_id === user.id) {
      return {
        id: match.player2_id,
        username: match.player2_profile?.username || 'Unknown Player',
        avatar: match.player2_profile?.avatar || '/placeholder.svg',
      };
    } else {
      return {
        id: match.player1_id,
        username: match.player1_profile?.username || 'Unknown Player',
        avatar: match.player1_profile?.avatar || '/placeholder.svg',
      };
    }
  };

  // Check if user won a match
  const didUserWin = (match: Match): boolean => {
    return match.winner_id === user?.id;
  };

  // Get recent matches (last 5)
  const getRecentMatches = () => {
    return matches.slice(0, 5);
  };

  // Get matches by game mode
  const getMatchesByMode = (gameMode: GameMode) => {
    return matches.filter(match => match.match_type === gameMode);
  };

  // Fetch matches when user changes
  useEffect(() => {
    if (user) {
      fetchMatches();
    } else {
      setMatches([]);
      setStats({
        totalMatches: 0,
        matchesWon: 0,
        winRate: 0,
        totalExpGained: 0,
      });
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscription for new matches
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('user_matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `player1_id=eq.${user.id},player2_id=eq.${user.id}`,
        },
        () => {
          // Refresh matches when there are changes
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    matches,
    loading,
    stats,
    recordMatch,
    updateUserExp,
    getOpponentInfo,
    didUserWin,
    getRecentMatches,
    getMatchesByMode,
    refetch: fetchMatches,
  };
};