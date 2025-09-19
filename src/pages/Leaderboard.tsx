import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Crown, Star, Loader2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('exp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (position: number) => {
    if (position <= 3) return 'default';
    if (position <= 10) return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Trophy className="h-10 w-10 text-primary" />
              Global Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground">
              See how you rank against the best players worldwide
            </p>
          </div>

          {/* Top 3 Podium */}
          {leaders.length >= 3 && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <Card className="relative overflow-hidden border-gray-400/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-400" />
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Medal className="h-8 w-8 text-gray-400" />
                  </div>
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src={leaders[1]?.avatar} />
                    <AvatarFallback className="text-lg">
                      {leaders[1]?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{leaders[1]?.username}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">
                    #{2} • {leaders[1]?.exp} EXP
                  </Badge>
                </CardHeader>
              </Card>

              {/* 1st Place */}
              <Card className="relative overflow-hidden border-yellow-500/20 transform scale-105">
                <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Crown className="h-10 w-10 text-yellow-500" />
                  </div>
                  <Avatar className="h-20 w-20 mx-auto mb-2 ring-4 ring-yellow-500/20">
                    <AvatarImage src={leaders[0]?.avatar} />
                    <AvatarFallback className="text-xl">
                      {leaders[0]?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{leaders[0]?.username}</CardTitle>
                  <Badge className="mx-auto bg-yellow-500 text-black hover:bg-yellow-600">
                    👑 Champion • {leaders[0]?.exp} EXP
                  </Badge>
                </CardHeader>
              </Card>

              {/* 3rd Place */}
              <Card className="relative overflow-hidden border-amber-600/20">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-600" />
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Medal className="h-8 w-8 text-amber-600" />
                  </div>
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src={leaders[2]?.avatar} />
                    <AvatarFallback className="text-lg">
                      {leaders[2]?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{leaders[2]?.username}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">
                    #{3} • {leaders[2]?.exp} EXP
                  </Badge>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>All Players</CardTitle>
              <CardDescription>Complete ranking of all players</CardDescription>
            </CardHeader>
            <CardContent>
              {leaders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No players yet</h3>
                  <p>Be the first to join and claim the top spot!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaders.map((player, index) => {
                    const position = index + 1;
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                          position <= 3 ? 'bg-muted/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 w-12">
                            {getRankIcon(position)}
                            <Badge variant={getRankBadgeVariant(position)} className="w-full justify-center">
                              #{position}
                            </Badge>
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={player.avatar} />
                            <AvatarFallback>
                              {player.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="font-medium">{player.username}</div>
                            <div className="text-sm text-muted-foreground">
                              Level {player.rank}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-primary">{player.exp} EXP</div>
                          <div className="text-sm text-muted-foreground">
                            Joined {new Date(player.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;