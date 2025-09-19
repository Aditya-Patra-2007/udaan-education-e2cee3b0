import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI study assistant. I can help you with any subject - ask me questions, request explanations, or get study tips. What would you like to learn about today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in real app, this would call your AI service)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your question! In a real implementation, I would connect to an AI service like GPT to provide you with helpful study assistance. For now, I'm a placeholder response showing how the chat interface works.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              AI Study Assistant
            </h1>
            <p className="text-muted-foreground">
              Get instant help with your studies from our AI tutor
            </p>
          </div>

          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Chat with AI Tutor
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 opacity-70`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {message.sender === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your studies..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4">
              <h3 className="font-medium mb-2">📚 Study Tips</h3>
              <p className="text-sm text-muted-foreground">
                Ask for study strategies, note-taking methods, and learning techniques
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">🧮 Problem Solving</h3>
              <p className="text-sm text-muted-foreground">
                Get help with math, science, and other problem-solving subjects
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">📝 Writing Help</h3>
              <p className="text-sm text-muted-foreground">
                Improve your essays, reports, and creative writing with AI feedback
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;