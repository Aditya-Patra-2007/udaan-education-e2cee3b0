// AI Service for chat functionality using free AI APIs
// This implementation tries multiple free AI providers similar to gpt4free

export interface AIMessage {
  content: string;
  type: 'text' | 'code' | 'explanation';
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  relatedTopics?: string[];
}

interface AIProvider {
  name: string;
  url: string;
  headers: Record<string, string>;
  formatRequest: (message: string, context?: string[]) => any;
  parseResponse: (data: any) => string;
}

class AIService {
  private providers: AIProvider[] = [
    // Provider 1: Hugging Face Inference API (Free tier)
    {
      name: 'HuggingFace',
      url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      headers: {
        'Content-Type': 'application/json'
      },
      formatRequest: (message: string, context?: string[]) => ({
        inputs: `Student: ${message}\nTutor:`,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false,
          do_sample: true
        }
      }),
      parseResponse: (data: any) => {
        if (Array.isArray(data) && data[0]?.generated_text) {
          let response = data[0].generated_text.trim();
          // Clean up the response
          response = response.replace(/^(Tutor:|Student:|AI:)/i, '').trim();
          if (response.length > 20) {
            return response;
          }
        }
        return null;
      }
    },

    // Provider 2: Alternative AI service
    {
      name: 'FastGPT',
      url: 'https://api.openai-proxy.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy-key'
      },
      formatRequest: (message: string, context?: string[]) => ({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI tutor. Provide educational, encouraging responses to student questions. Keep responses concise but informative.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      }),
      parseResponse: (data: any) => {
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content.trim();
        }
        return null;
      }
    },

    // Provider 3: Educational AI
    {
      name: 'EducationalAI',
      url: 'https://api.cohere.ai/v1/generate',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy-key'
      },
      formatRequest: (message: string, context?: string[]) => ({
        model: 'command',
        prompt: `As an educational AI tutor, respond helpfully to this student question: "${message}"\n\nResponse:`,
        max_tokens: 150,
        temperature: 0.8,
        k: 0,
        stop_sequences: ["\n\n"],
        return_likelihoods: 'NONE'
      }),
      parseResponse: (data: any) => {
        if (data.generations && data.generations[0]?.text) {
          let response = data.generations[0].text.trim();
          response = response.replace(/^(Response:|AI:|Tutor:)/i, '').trim();
          if (response.length > 20) {
            return response;
          }
        }
        return null;
      }
    }
  ];

  async generateResponse(userMessage: string, context?: string[]): Promise<AIResponse> {
    console.log('AI Service: Generating response for:', userMessage);
    
    // First, try the intelligent local response system
    const localResponse = this.getIntelligentResponse(userMessage, context);
    if (localResponse.isSpecific) {
      console.log('AI Service: Using intelligent local response');
      return {
        message: localResponse.message,
        suggestions: this.generateSuggestions(userMessage),
        relatedTopics: this.generateRelatedTopics(userMessage),
      };
    }
    
    // Try each provider until one works
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      console.log(`AI Service: Trying provider ${i + 1}/${this.providers.length}: ${provider.name}`);
      
      try {
        const response = await this.callProvider(provider, userMessage, context);
        if (response) {
          console.log(`AI Service: Success with ${provider.name}:`, response.substring(0, 100) + '...');
          return {
            message: response,
            suggestions: this.generateSuggestions(userMessage),
            relatedTopics: this.generateRelatedTopics(userMessage),
          };
        } else {
          console.log(`AI Service: ${provider.name} returned empty/invalid response`);
        }
      } catch (error) {
        console.warn(`AI Service: Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    // If all providers fail, use simulated response
    console.log('AI Service: All AI providers failed, using simulated response');
    return this.getSimulatedResponse(userMessage);
  }

  private getIntelligentResponse(userMessage: string, context?: string[]): { message: string; isSpecific: boolean } {
    const message = userMessage.toLowerCase();
    
    // Handle specific math questions
    if (message.includes('2 + 2') || message.includes('2+2')) {
      return { message: "2 + 2 equals 4! This is a basic addition problem. Would you like me to explain how addition works or help you with more math problems?", isSpecific: true };
    }
    
    if (message.includes('solve') && (message.includes('x') || message.includes('equation'))) {
      return { message: "I'd be happy to help you solve equations! To solve equations, we need to isolate the variable (usually x) by performing the same operations on both sides. Can you share the specific equation you're working on?", isSpecific: true };
    }
    
    // Handle specific science questions
    if (message.includes('photosynthesis')) {
      return { message: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create glucose (sugar) and oxygen. The basic equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Would you like me to explain any specific part of this process?", isSpecific: true };
    }
    
    if (message.includes('gravity')) {
      return { message: "Gravity is a fundamental force that attracts objects with mass toward each other. On Earth, gravity pulls objects toward the center at about 9.8 m/s². This is why things fall down! What specific aspect of gravity would you like to explore?", isSpecific: true };
    }
    
    // Handle specific history questions
    if (message.includes('world war') && (message.includes('1') || message.includes('2') || message.includes('i') || message.includes('ii'))) {
      return { message: "The World Wars were major global conflicts of the 20th century. World War I (1914-1918) was called 'The Great War,' while World War II (1939-1945) was the deadliest conflict in human history. Which specific aspects would you like to learn about?", isSpecific: true };
    }
    
    // Handle writing and English questions
    if (message.includes('essay') && (message.includes('write') || message.includes('how'))) {
      return { message: "Writing a good essay involves several key steps: 1) Understanding the prompt, 2) Brainstorming and research, 3) Creating an outline, 4) Writing with clear introduction, body, and conclusion, 5) Revising and editing. What type of essay are you working on?", isSpecific: true };
    }
    
    // Handle study tips
    if (message.includes('study') && (message.includes('better') || message.includes('improve') || message.includes('tips'))) {
      return { message: "Here are proven study techniques: 1) Active recall (testing yourself), 2) Spaced repetition (reviewing over time), 3) Pomodoro Technique (25-min focused sessions), 4) Teaching others, 5) Creating mind maps. Which subjects are you studying?", isSpecific: true };
    }
    
    // Handle specific math topics
    if (message.includes('algebra') && (message.includes('what') || message.includes('explain'))) {
      return { message: "Algebra is a branch of mathematics that uses letters (variables) to represent unknown numbers. For example, in '2x + 5 = 15', we solve for x. Algebra helps us solve real-world problems and is the foundation for advanced math. What algebra concept would you like help with?", isSpecific: true };
    }
    
    // Handle homework help
    if (message.includes('homework') || message.includes('assignment')) {
      return { message: "I'm here to help you understand your homework! While I can't do it for you, I can explain concepts, walk through examples, and help you develop problem-solving strategies. What subject is your homework in, and what specific topic are you working on?", isSpecific: true };
    }
    
    // Check for question words that indicate they want specific information
    if (message.includes('what is') || message.includes('what are') || message.includes('how do') || message.includes('why does')) {
      const topic = this.extractTopicFromQuestion(message);
      if (topic) {
        return { message: `Great question about ${topic}! I'd love to help you understand this concept better. To give you the most helpful explanation, could you tell me what specific aspect of ${topic} you'd like me to focus on? Are you looking for a basic definition, examples, or how it applies to your studies?`, isSpecific: true };
      }
    }
    
    return { message: "", isSpecific: false };
  }
  
  private extractTopicFromQuestion(message: string): string | null {
    const patterns = [
      /what is ([\w\s]+)[\?\.]*/i,
      /what are ([\w\s]+)[\?\.]*/i,
      /how do ([\w\s]+)[\?\.]*/i,
      /why does ([\w\s]+)[\?\.]*/i,
      /explain ([\w\s]+)[\?\.]*/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  private async callProvider(provider: AIProvider, userMessage: string, context?: string[]): Promise<string | null> {
    try {
      const requestBody = provider.formatRequest(userMessage, context);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: provider.headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const result = provider.parseResponse(data);
      
      // Validate the response
      if (result && result.length > 10 && !result.includes('Sorry, I could not generate')) {
        return result;
      }
      
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`${provider.name} request timed out`);
      } else {
        console.error(`Error calling ${provider.name}:`, error);
      }
      return null;
    }
  }

  private getSimulatedResponse(userMessage: string): AIResponse {
    const message = userMessage.toLowerCase();
    
    let response: string;
    let suggestions: string[] = [];
    let relatedTopics: string[] = [];

    // Enhanced educational responses with more variety and better pattern matching
    if (message.includes('math') || message.includes('mathematics') || message.includes('algebra') || message.includes('calculus') || message.includes('geometry') || message.includes('equation') || message.includes('solve')) {
      const mathResponses = [
        "Mathematics is a fascinating subject! I'd be happy to help you with any math topics. Whether you're working on algebra, geometry, calculus, or basic arithmetic, I can provide explanations, examples, and practice problems. What specific area of math would you like to explore?",
        "Great question about math! Mathematics is all about problem-solving and logical thinking. I can help you understand concepts step-by-step, provide practice problems, and show you real-world applications. What math topic are you currently studying?",
        "I love helping with mathematics! Math builds critical thinking skills that are useful in many areas of life. From basic operations to advanced calculus, I can break down complex concepts into understandable parts. What mathematical concept would you like to explore?"
      ];
      response = mathResponses[Math.floor(Math.random() * mathResponses.length)];
      suggestions = ["Show me algebra examples", "Explain geometry basics", "Help with calculus", "Practice arithmetic problems"];
      relatedTopics = ["Algebra", "Geometry", "Calculus", "Statistics"];
    } else if (message.includes('science') || message.includes('physics') || message.includes('chemistry') || message.includes('biology') || message.includes('experiment') || message.includes('theory')) {
      const scienceResponses = [
        "Science is all around us! I can help you understand concepts in physics, chemistry, biology, and earth science. From basic principles to complex theories, I'll break things down into easy-to-understand explanations. What scientific topic interests you most?",
        "Excellent question about science! Science helps us understand how the world works through observation and experimentation. I can explain scientific concepts, discuss real-world applications, and help you understand the scientific method. What area of science would you like to explore?",
        "I'm excited to help with science! Whether it's understanding chemical reactions, exploring physics principles, or learning about living organisms, science is fascinating. I can provide clear explanations and interesting examples. What scientific concept are you curious about?"
      ];
      response = scienceResponses[Math.floor(Math.random() * scienceResponses.length)];
      suggestions = ["Explain physics concepts", "Chemistry basics", "Biology fundamentals", "Scientific method"];
      relatedTopics = ["Physics", "Chemistry", "Biology", "Earth Science"];
    } else if (message.includes('history') || message.includes('historical') || message.includes('war') || message.includes('ancient') || message.includes('civilization')) {
      const historyResponses = [
        "History helps us understand how we got to where we are today! I can discuss world history, specific time periods, historical figures, and important events. What period or aspect of history would you like to learn about?",
        "Great interest in history! Learning about the past helps us understand the present and make better decisions for the future. I can explore different civilizations, historical events, and influential people throughout time. What historical topic interests you?",
        "I'd love to help with history! From ancient civilizations to modern times, history is full of fascinating stories and important lessons. I can discuss causes and effects, analyze historical events, and explore how the past shapes our world today. What would you like to explore?"
      ];
      response = historyResponses[Math.floor(Math.random() * historyResponses.length)];
      suggestions = ["World War II", "Ancient civilizations", "American history", "Modern history"];
      relatedTopics = ["World History", "American History", "Ancient History", "Modern History"];
    } else if (message.includes('english') || message.includes('literature') || message.includes('writing') || message.includes('essay') || message.includes('grammar') || message.includes('read')) {
      const englishResponses = [
        "English and literature open up worlds of creativity and communication! I can help with grammar, writing techniques, literary analysis, reading comprehension, and more. Are you working on a specific writing project or studying particular literature?",
        "Wonderful question about English! Language and literature are powerful tools for expression and understanding. I can assist with essay writing, poetry analysis, grammar rules, and reading strategies. What aspect of English would you like to work on?",
        "I'm here to help with English! From creative writing to literary analysis, grammar to vocabulary, English skills are essential for effective communication. I can provide writing tips, help with analysis, and explain language concepts clearly. What would you like to focus on?"
      ];
      response = englishResponses[Math.floor(Math.random() * englishResponses.length)];
      suggestions = ["Grammar help", "Essay writing tips", "Poetry analysis", "Reading strategies"];
      relatedTopics = ["Grammar", "Creative Writing", "Literature Analysis", "Poetry"];
    } else if (message.includes('study') || message.includes('learn') || message.includes('tips') || message.includes('help') || message.includes('how') || message.includes('prepare')) {
      const studyResponses = [
        "Great question about studying! Effective learning involves several strategies: active recall, spaced repetition, breaking information into chunks, and connecting new knowledge to what you already know. I can help you develop a personalized study plan. What subject are you studying, and what challenges are you facing?",
        "I'm excited to help you improve your study skills! Good study habits include setting clear goals, creating a distraction-free environment, taking regular breaks, and using various learning techniques. What specific study challenges would you like to work on?",
        "Excellent question about learning! Everyone learns differently, so it's important to find techniques that work best for you. I can help with time management, note-taking strategies, memory techniques, and test preparation. What aspect of studying would you like to improve?"
      ];
      response = studyResponses[Math.floor(Math.random() * studyResponses.length)];
      suggestions = ["Study schedule tips", "Memory techniques", "Note-taking strategies", "Test preparation"];
      relatedTopics = ["Study Techniques", "Memory", "Time Management", "Test Prep"];
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('start') || message.length < 10) {
      const greetingResponses = [
        "Hello! I'm your AI study assistant, and I'm excited to help you learn! I can assist with a wide range of subjects including mathematics, science, history, English, and study techniques. What would you like to explore today?",
        "Hi there! Welcome to your personal AI tutor! I'm here to help you understand concepts, practice problems, and develop effective study strategies. Whether you need help with homework or want to learn something new, I'm ready to assist. What subject interests you?",
        "Hey! Great to meet you! I'm your educational AI assistant, ready to help you learn and grow. From explaining complex concepts to providing study tips, I'm here to support your learning journey. What would you like to learn about today?"
      ];
      response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      suggestions = ["Help with math problems", "Explain science concepts", "Study tips and strategies", "Writing and grammar help"];
      relatedTopics = ["Mathematics", "Science", "History", "English", "Study Skills"];
    } else if (message.includes('explain') || message.includes('what is') || message.includes('define') || message.includes('meaning')) {
      const explanationResponses = [
        `I'd be happy to explain that concept! To give you the best explanation, could you tell me more specifically what you'd like me to explain about "${userMessage}"? I can break it down step by step and provide examples.`,
        `Great question! I can definitely help explain that. Let me know what specific aspect of "${userMessage}" you'd like me to focus on, and I'll provide a clear, detailed explanation with examples.`,
        `Excellent inquiry! I love helping students understand new concepts. For "${userMessage}", I can provide definitions, examples, and practical applications. What level of detail would you like me to go into?`
      ];
      response = explanationResponses[Math.floor(Math.random() * explanationResponses.length)];
      suggestions = ["Give me examples", "Explain it simply", "Show me step by step", "Real world applications"];
      relatedTopics = ["Concepts", "Examples", "Applications", "Understanding"];
    } else {
      // More dynamic responses based on the actual content
      const specificResponses = [
        `That's an interesting question about "${userMessage}"! I'm here to help you learn and understand various academic topics. Let me provide some guidance on this topic. What specific aspect would you like me to focus on?`,
        `Great question! I can see you're asking about "${userMessage}". I'd be happy to help you understand this better. Would you like me to explain the concept, provide examples, or discuss how it applies to your studies?`,
        `I appreciate your curiosity about "${userMessage}"! As your AI study assistant, I can help break this down into understandable parts. What would be most helpful - a basic explanation, detailed analysis, or practical examples?`,
        `Interesting topic! For "${userMessage}", I can provide explanations, examples, and study strategies. What specific information are you looking for, or what's challenging you about this topic?`
      ];
      response = specificResponses[Math.floor(Math.random() * specificResponses.length)];
      suggestions = ["Explain the basics", "Give me examples", "Study tips for this topic", "Related concepts"];
      relatedTopics = ["Study Skills", "Academic Subjects", "Learning Strategies", "Understanding"];
    }

    return { message: response, suggestions, relatedTopics };
  }

  private generateSuggestions(userMessage: string): string[] {
    // Generate contextual suggestions based on the user's message
    const message = userMessage.toLowerCase();
    
    if (message.includes('math')) {
      return ["Show me examples", "Practice problems", "Explain the concept", "Related formulas"];
    } else if (message.includes('science')) {
      return ["Show experiments", "Explain theories", "Real-world applications", "Related concepts"];
    } else if (message.includes('history')) {
      return ["Key dates", "Important figures", "Cause and effect", "Timeline"];
    } else {
      return ["Tell me more", "Give examples", "Explain simply", "Practice questions"];
    }
  }

  private generateRelatedTopics(userMessage: string): string[] {
    // Generate related topics based on the user's message
    const message = userMessage.toLowerCase();
    
    if (message.includes('math') || message.includes('algebra')) {
      return ["Geometry", "Calculus", "Statistics", "Trigonometry"];
    } else if (message.includes('science') || message.includes('physics')) {
      return ["Chemistry", "Biology", "Earth Science", "Astronomy"];
    } else if (message.includes('history')) {
      return ["Geography", "Political Science", "Economics", "Sociology"];
    } else {
      return ["Study Skills", "Critical Thinking", "Research Methods", "Academic Writing"];
    }
  }

  // Method to generate educational content
  async generateQuizQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    // Simulated quiz generation - in production, use AI to generate questions
    const questions = {
      mathematics: {
        easy: {
          question: "What is 15 + 27?",
          options: ["42", "41", "43", "40"],
          correct: 0,
          explanation: "15 + 27 = 42. When adding, align the numbers and add column by column from right to left."
        },
        medium: {
          question: "Solve for x: 2x + 5 = 15",
          options: ["x = 5", "x = 10", "x = 7", "x = 3"],
          correct: 0,
          explanation: "2x + 5 = 15, so 2x = 10, therefore x = 5."
        },
        hard: {
          question: "What is the derivative of x² + 3x + 2?",
          options: ["2x + 3", "x² + 3", "2x + 2", "x + 3"],
          correct: 0,
          explanation: "The derivative of x² is 2x, the derivative of 3x is 3, and the derivative of a constant is 0."
        }
      }
    };

    return questions.mathematics[difficulty] || questions.mathematics.medium;
  }
}

export const aiService = new AIService();