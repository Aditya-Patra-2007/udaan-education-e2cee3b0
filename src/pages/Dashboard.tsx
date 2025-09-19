import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Navigation } from '@/components/Navigation';
import { Brain, Swords, Trophy, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="text-xl">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{profile?.username}</CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Experience</span>
                  <Badge variant="secondary" className="px-3 py-1">
                    {profile?.exp || 0} EXP
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rank</span>
                  <Badge variant="outline" className="px-3 py-1">
                    Level {profile?.rank || 1}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((profile?.exp || 0) % 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {100 - ((profile?.exp || 0) % 100)} EXP to next level
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Matches Played</span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Win Rate</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Global Rank</span>
                  <span className="text-sm font-medium">#-</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.username}!</h1>
              <p className="text-muted-foreground">Choose your next challenge and level up your skills</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* PvP Battles */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Swords className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>PvP Battles</CardTitle>
                      <CardDescription>Challenge other players</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Test your knowledge against real opponents in spelling bees and comprehension challenges.
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full" variant="default">
                      <Link to="/pvp">
                        <Brain className="h-4 w-4 mr-2" />
                        Comprehension Battle
                      </Link>
                    </Button>
                    <Button asChild className="w-full" variant="outline">
                      <Link to="/pvp">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Spelling Bee
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Chat */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>AI Study Helper</CardTitle>
                      <CardDescription>Get instant help</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Chat with our AI tutor for personalized learning assistance and study tips.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/chat">Start Studying</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>Leaderboard</CardTitle>
                      <CardDescription>See top players</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Check your ranking against other players and see who's dominating the arena.
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/leaderboard">View Rankings</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest matches and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start your first battle to see your progress here!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;