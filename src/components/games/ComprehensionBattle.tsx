import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useContent, ReadingPassage, ComprehensionQuestion } from '@/hooks/useContent';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ComprehensionBattleProps {
  onGameEnd: (score: number, totalQuestions: number) => void;
  opponentUsername: string;
}

export const ComprehensionBattle = ({ onGameEnd, opponentUsername }: ComprehensionBattleProps) => {
  const { getRandomPassage } = useContent();
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gamePhase, setGamePhase] = useState<'loading' | 'reading' | 'questions' | 'finished'>('loading');
  const [readingTimeLeft, setReadingTimeLeft] = useState(120); // 2 minutes to read
  const [score, setScore] = useState(0);

  // Load random passage and questions when component mounts
  useEffect(() => {
    const loadContent = async () => {
      try {
        const randomPassage = await getRandomPassage('medium');
        if (randomPassage && randomPassage.questions) {
          setPassage(randomPassage);
          
          // Convert database questions to component format
          const formattedQuestions: Question[] = randomPassage.questions.map(q => ({
            id: q.id,
            question: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
          }));
          
          setQuestions(formattedQuestions);
          setAnswers(new Array(formattedQuestions.length).fill(null));
          setGamePhase('reading');
        } else {
          // Fallback to hardcoded content if no database content available
          loadFallbackContent();
        }
      } catch (error) {
        console.error('Error loading content:', error);
        loadFallbackContent();
      }
    };

    loadContent();
  }, [getRandomPassage]);

  const loadFallbackContent = () => {
    // Fallback content if database is not available
    const fallbackPassage = {
      id: 'fallback',
      title: 'Artificial Intelligence: Past, Present, and Future',
      content: `The concept of artificial intelligence has fascinated humanity for decades. From science fiction novels to modern technological breakthroughs, AI represents our desire to create machines that can think, learn, and problem-solve like humans. 

Early AI research began in the 1950s with scientists like Alan Turing, who proposed the famous "Turing Test" as a way to measure machine intelligence. This test challenges a machine to engage in conversations indistinguishable from those of a human being.

Today, AI technologies power everything from search engines and recommendation systems to autonomous vehicles and medical diagnosis tools. Machine learning, a subset of AI, enables computers to learn from data without being explicitly programmed for every task. Deep learning, which uses neural networks inspired by the human brain, has led to remarkable advances in image recognition, natural language processing, and game playing.

However, the rapid advancement of AI also raises important questions about ethics, job displacement, and the future of human-machine interaction. As AI becomes more sophisticated, society must carefully consider how to harness its benefits while addressing potential risks and ensuring it serves humanity's best interests.`,
      difficulty_level: 'medium' as const,
      subject: 'Technology',
      grade_level: 8,
      created_at: new Date().toISOString(),
    };

    const fallbackQuestions: Question[] = [
      {
        id: '1',
        question: 'Who proposed the famous test to measure machine intelligence?',
        options: ['Isaac Newton', 'Alan Turing', 'Albert Einstein', 'Charles Darwin'],
        correctAnswer: 1
      },
      {
        id: '2',
        question: 'What does machine learning enable computers to do?',
        options: [
          'Only follow pre-programmed instructions',
          'Learn from data without explicit programming',
          'Replace all human workers',
          'Think exactly like humans'
        ],
        correctAnswer: 1
      },
      {
        id: '3',
        question: 'According to the passage, what is deep learning inspired by?',
        options: ['Computer circuits', 'The human brain', 'Ocean waves', 'Mathematical equations'],
        correctAnswer: 1
      },
      {
        id: '4',
        question: 'What are some concerns mentioned about AI advancement?',
        options: [
          'Only technical limitations',
          'Ethics, job displacement, and human-machine interaction',
          'Only cost considerations',
          'Only speed of development'
        ],
        correctAnswer: 1
      },
      {
        id: '5',
        question: 'When did early AI research begin according to the passage?',
        options: ['1940s', '1950s', '1960s', '1970s'],
        correctAnswer: 1
      }
    ];

    setPassage(fallbackPassage);
    setQuestions(fallbackQuestions);
    setAnswers(new Array(fallbackQuestions.length).fill(null));
    setGamePhase('reading');
  };

  // Reading phase timer
  useEffect(() => {
    if (gamePhase === 'reading' && readingTimeLeft > 0) {
      const timer = setTimeout(() => setReadingTimeLeft(readingTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'reading' && readingTimeLeft === 0) {
      setGamePhase('questions');
    }
  }, [readingTimeLeft, gamePhase]);

  // Questions phase timer
  useEffect(() => {
    if (gamePhase === 'questions' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'questions' && timeLeft === 0) {
      finishGame();
    }
  }, [timeLeft, gamePhase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    const answerIndex = parseInt(selectedAnswer);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const finalAnswers = selectedAnswer ? 
      [...answers.slice(0, currentQuestion), parseInt(selectedAnswer), ...answers.slice(currentQuestion + 1)] : 
      answers;
    
    const finalScore = finalAnswers.reduce((score, answer, index) => {
      return answer === questions[index].correctAnswer ? score + 1 : score;
    }, 0);
    
    setScore(finalScore);
    setGamePhase('finished');
    onGameEnd(finalScore, questions.length);
  };

  const startQuestions = () => {
    setGamePhase('questions');
  };

  if (gamePhase === 'reading') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reading Phase</h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              vs {opponentUsername}
            </Badge>
            <Badge className="px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(readingTimeLeft)}
            </Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{passage?.title || "Reading Passage"}</CardTitle>
            <CardDescription>Read the passage carefully. You'll answer questions about it next.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {passage?.content?.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 text-base leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={startQuestions} size="lg">
            I'm Ready for Questions
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Questions will automatically start when time runs out
          </p>
        </div>
      </div>
    );
  }

  if (gamePhase === 'finished') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Battle Complete!</CardTitle>
            <CardDescription>See how you performed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold text-primary">
              {score}/{questions.length}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% Accuracy
            </div>
            <Progress value={percentage} className="w-full" />
            <div className="flex justify-center">
              {percentage >= 80 ? (
                <Badge className="text-lg px-4 py-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Excellent Performance!
                </Badge>
              ) : percentage >= 60 ? (
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Good Job!
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  <XCircle className="h-5 w-5 mr-2" />
                  Keep Practicing!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Question {currentQuestion + 1} of {questions.length}</h2>
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
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
            >
              {currentQuestion === questions.length - 1 ? 'Finish Game' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};