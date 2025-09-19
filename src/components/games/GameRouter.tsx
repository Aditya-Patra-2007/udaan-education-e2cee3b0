import { useState } from 'react';
import { ComprehensionBattle } from './ComprehensionBattle';
import { SpellingBee } from './SpellingBee';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw } from 'lucide-react';

export type GameMode = 'comprehension' | 'spellbee';

interface GameRouterProps {
  gameMode: GameMode;
  opponentUsername: string;
  onGameEnd: (score: number, totalQuestions: number, gameMode: GameMode) => void;
  onReturnToLobby: () => void;
}

export const GameRouter = ({ gameMode, opponentUsername, onGameEnd, onReturnToLobby }: GameRouterProps) => {
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResults, setGameResults] = useState<{ score: number; total: number; mode: GameMode } | null>(null);

  const handleGameEnd = (score: number, total: number) => {
    setGameResults({ score, total, mode: gameMode });
    setGameCompleted(true);
    onGameEnd(score, total, gameMode);
  };

  const handlePlayAgain = () => {
    setGameCompleted(false);
    setGameResults(null);
  };

  if (gameCompleted && gameResults) {
    const percentage = Math.round((gameResults.score / gameResults.total) * 100);
    const expGained = calculateExpGained(gameResults.score, gameResults.total, gameMode);
    
    return (
      <div className="max-w-2xl mx-auto text-center p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Game Complete!</CardTitle>
            <CardDescription>
              {gameMode === 'comprehension' ? 'Comprehension Battle' : 'Spelling Bee'} Results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold text-primary">
              {gameResults.score}/{gameResults.total}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% Accuracy
            </div>
            
            <div className="flex justify-center items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <Badge className="text-lg px-4 py-2">
                +{expGained} EXP Gained
              </Badge>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handlePlayAgain} size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={onReturnToLobby} variant="outline" size="lg">
                Return to Lobby
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameMode === 'comprehension') {
    return (
      <ComprehensionBattle 
        onGameEnd={handleGameEnd}
        opponentUsername={opponentUsername}
      />
    );
  } else {
    return (
      <SpellingBee 
        onGameEnd={handleGameEnd}
        opponentUsername={opponentUsername}
      />
    );
  }
};

function calculateExpGained(score: number, total: number, gameMode: GameMode): number {
  const baseExp = gameMode === 'comprehension' ? 10 : 15;
  const maxBonus = gameMode === 'comprehension' ? 15 : 15;
  const percentage = score / total;
  
  return Math.round(baseExp + (maxBonus * percentage));
}