import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Trophy, Swords, MessageSquare, LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Swords className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">AI PvP Arena</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Button
              asChild
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/pvp') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/pvp">
                <Swords className="h-4 w-4 mr-2" />
                PvP Battle
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/leaderboard') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/chat') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </Link>
            </Button>
          </div>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback>
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navigation };