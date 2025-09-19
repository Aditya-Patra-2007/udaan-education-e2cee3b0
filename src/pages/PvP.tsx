import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Navigation } from '@/components/Navigation';
import { Swords, Brain, Users, Clock, Loader2 } from 'lucide-react';

const PvP = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [selectedMode, setSelectedMode] = useState<'comprehension' | 'spellbee' | null>(null);
  const [matchmaking, setMatchmaking] = useState(false);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleStartMatch = (mode: 'comprehension' | 'spellbee') => {
    setSelectedMode(mode);
    setMatchmaking(true);
    
    // Simulate matchmaking delay
    setTimeout(() => {
      setMatchmaking(false);
      // In a real app, this would connect to actual matchmaking
    }, 3000);
  };

  if (matchmaking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Users className="h-16 w-16 text-primary animate-pulse" />
                    <div className="absolute -top-2 -right-2">
                      <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                    </div>
                  </div>
                </div>
                <CardTitle>Finding Opponent...</CardTitle>
                <CardDescription>
                  Searching for players in {selectedMode} mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Badge variant="outline" className="px-4 py-2">
                      <Clock className="h-4 w-4 mr-2" />
                      Est. wait: 30s
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setMatchmaking(false)}
                    className="w-full"
                  >
                    Cancel Matchmaking
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <h1 className="text-4xl font-bold mb-4">PvP Battle Arena</h1>
            <p className="text-xl text-muted-foreground">
              Challenge players worldwide and prove your knowledge!
            </p>
          </div>

          {/* Player Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{profile?.exp || 0}</div>
                <div className="text-sm text-muted-foreground">Total EXP</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">Level {profile?.rank || 1}</div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Matches Won</div>
              </CardContent>
            </Card>
          </div>

          {/* Game Modes */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-10 w-10 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Comprehension Battle</CardTitle>
                    <CardDescription>Test reading comprehension skills</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• AI-generated reading passages</p>
                  <p>• Multiple choice questions</p>
                  <p>• 5 minutes per round</p>
                  <p>• Earn 10-25 EXP per win</p>
                </div>
                <Button 
                  onClick={() => handleStartMatch('comprehension')}
                  className="w-full"
                  size="lg"
                >
                  <Swords className="h-4 w-4 mr-2" />
                  Start Comprehension Battle
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-lg font-bold">Aa</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Spelling Bee</CardTitle>
                    <CardDescription>Challenge spelling mastery</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Progressive difficulty words</p>
                  <p>• Audio pronunciation</p>
                  <p>• 3 minutes per round</p>
                  <p>• Earn 15-30 EXP per win</p>
                </div>
                <Button 
                  onClick={() => handleStartMatch('spellbee')}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  <Swords className="h-4 w-4 mr-2" />
                  Start Spelling Bee
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Matches */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Your battle history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Swords className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No matches yet</h3>
                <p>Start your first battle to see your match history here!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PvP;