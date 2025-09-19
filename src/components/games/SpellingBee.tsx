import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Clock, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import { useContent, type SpellingWord } from '@/hooks/useContent';

interface SpellingBeeProps {
  onGameEnd: (score: number, totalWords: number) => void;
  opponentUsername: string;
}

const sampleWords: SpellingWord[] = [
  {
    id: '1',
    word: 'necessary',
    definition: 'Required to be done, achieved, or present; needed; essential.',
    difficulty_level: 'medium',
    pronunciation: 'NES-uh-ser-ee',
    subject_category: 'spelling'
  },
  {
    id: '2',
    word: 'mathematics',
    definition: 'The abstract science of number, quantity, and space.',
    difficulty_level: 'easy',
    pronunciation: 'math-uh-MAT-iks',
    subject_category: 'spelling'
  },
  {
    id: '3',
    word: 'rhythm',
    definition: 'A strong, regular, repeated pattern of movement or sound.',
    difficulty_level: 'hard',
    pronunciation: 'RITH-uhm',
    subject_category: 'spelling'
  },
  {
    id: '4',
    word: 'entrepreneur',
    definition: 'A person who organizes and operates a business, taking on greater than normal financial risks.',
    difficulty_level: 'hard',
    pronunciation: 'ahn-truh-pruh-NUR',
    subject_category: 'spelling'
  },
  {
    id: '5',
    word: 'beautiful',
    definition: 'Pleasing the senses or mind aesthetically.',
    difficulty_level: 'easy',
    pronunciation: 'BYOO-tuh-fuhl',
    subject_category: 'spelling'
  },
  {
    id: '6',
    word: 'definitely',
    definition: 'Without doubt; certainly.',
    difficulty_level: 'medium',
    pronunciation: 'DEF-uh-nit-lee',
    subject_category: 'spelling'
  },
  {
    id: '7',
    word: 'conscientious',
    definition: 'Wishing to do what is right, especially to do one\'s work or duty well and thoroughly.',
    difficulty_level: 'hard',
    pronunciation: 'kon-shee-EN-shuhs',
    subject_category: 'spelling'
  },
  {
    id: '8',
    word: 'immediately',
    definition: 'At once; instantly.',
    difficulty_level: 'medium',
    pronunciation: 'ih-MEE-dee-it-lee',
    subject_category: 'spelling'
  }
];

export const SpellingBee = ({ onGameEnd, opponentUsername }: SpellingBeeProps) => {
  const { getRandomSpellingWords } = useContent();
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWord, setCurrentWord] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gamePhase, setGamePhase] = useState<'playing' | 'finished'>('playing');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Load words when component mounts
  useEffect(() => {
    const loadWords = async () => {
      try {
        const spellingWords = await getRandomSpellingWords(8);
        setWords(spellingWords);
        setAnswers(new Array(spellingWords.length).fill(''));
        setLoading(false);
      } catch (error) {
        console.error('Failed to load spelling words:', error);
        // Fallback to sample words if API fails
        setWords(sampleWords);
        setAnswers(new Array(sampleWords.length).fill(''));
        setLoading(false);
      }
    };
    
    loadWords();
  }, [getRandomSpellingWords]);

  // Game timer
  useEffect(() => {
    if (gamePhase === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'playing' && timeLeft === 0) {
      finishGame();
    }
  }, [timeLeft, gamePhase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleNextWord = () => {
    const newAnswers = [...answers];
    newAnswers[currentWord] = userInput.trim();
    setAnswers(newAnswers);
    setUserInput('');
    setShowHint(false);

    if (currentWord < words.length - 1) {
      setCurrentWord(currentWord + 1);
    } else {
      finishGame();
    }
  };

  const handleSkipWord = () => {
    const newAnswers = [...answers];
    newAnswers[currentWord] = '';
    setAnswers(newAnswers);
    setUserInput('');
    setShowHint(false);

    if (currentWord < words.length - 1) {
      setCurrentWord(currentWord + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const finalAnswers = userInput ? 
      [...answers.slice(0, currentWord), userInput.trim(), ...answers.slice(currentWord + 1)] : 
      answers;
    
    const finalScore = finalAnswers.reduce((score, answer, index) => {
      return answer.toLowerCase() === words[index].word.toLowerCase() ? score + 1 : score;
    }, 0);
    
    setScore(finalScore);
    setGamePhase('finished');
    onGameEnd(finalScore, words.length);
  };

  const pronounceWord = () => {
    // In a real implementation, this would use Text-to-Speech API
    // For now, we'll just show an alert with pronunciation
    alert(`Pronunciation: ${words[currentWord].pronunciation}`);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-lg">Loading spelling words...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'finished') {
    const percentage = Math.round((score / words.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Spelling Bee Complete!</CardTitle>
            <CardDescription>See how you performed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold text-primary">
              {score}/{words.length}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% Accuracy
            </div>
            <Progress value={percentage} className="w-full" />
            <div className="flex justify-center">
              {percentage >= 80 ? (
                <Badge className="text-lg px-4 py-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Spelling Champion!
                </Badge>
              ) : percentage >= 60 ? (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Good Speller!
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  <XCircle className="h-5 w-5 mr-2" />
                  Keep Practicing!
                </Badge>
              )}
            </div>
            
            {/* Show correct answers */}
            <div className="mt-8 text-left">
              <h3 className="text-lg font-semibold mb-4">Review:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {words.map((word, index) => (
                  <div key={word.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex-1">
                      <span className="font-medium">{word.word}</span>
                      <span className="text-sm text-muted-foreground ml-2">({word.pronunciation})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{answers[index] || 'Skipped'}</span>
                      {answers[index]?.toLowerCase() === word.word.toLowerCase() ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const word = words[currentWord];
  const progress = ((currentWord + 1) / words.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Word {currentWord + 1} of {words.length}</h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            vs {opponentUsername}
          </Badge>
          <Badge className="px-3 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(timeLeft)}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="mb-6" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Spell the Word</CardTitle>
            <Badge className={`${getDifficultyColor(word.difficulty_level)} text-white`}>
              {word.difficulty_level.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Button 
              onClick={pronounceWord}
              variant="outline" 
              size="lg"
              className="w-full max-w-md"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              Listen to Word
            </Button>
            
            <div className="text-lg text-muted-foreground">
              Pronunciation: {word.pronunciation}
            </div>
          </div>

          <div className="space-y-4">
            <Input
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the spelling here..."
              className="text-xl text-center p-6"
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleNextWord()}
            />
            
            <div className="flex justify-center gap-2">
              <Button onClick={toggleHint} variant="outline">
                {showHint ? 'Hide' : 'Show'} Definition
              </Button>
            </div>

            {showHint && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-center italic">&quot;{word.definition}&quot;</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handleSkipWord}
            >
              Skip Word
            </Button>
            <Button 
              onClick={handleNextWord}
              disabled={!userInput.trim()}
            >
              {currentWord === words.length - 1 ? 'Finish Game' : 'Next Word'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};