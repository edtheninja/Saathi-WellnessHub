import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm SAATHI, your AI wellness companion. I'm here to listen and support you on your mental health journey. How are you feeling today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const botResponses = [
    "I understand how you're feeling. It's completely normal to have these emotions.",
    "Thank you for sharing that with me. Your feelings are valid and important.",
    "Have you tried any breathing exercises today? They can be really helpful for managing stress.",
    "Remember that small steps forward are still progress. You're doing great.",
    "It sounds like you're going through a challenging time. How can I best support you right now?",
    "Your mental health journey is unique to you. What self-care activities make you feel better?",
    "I'm here to listen without judgment. Feel free to share whatever is on your mind.",
    "That's a wonderful insight. How does it make you feel to recognize that about yourself?"
  ];

  const quickResponses = [
    "I'm feeling anxious",
    "I had a good day",
    "I'm struggling today",
    "Tell me about meditation",
    "I need motivation"
  ];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="bg-gradient-calm px-6 py-4 shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary-foreground">SAATHI AI</h1>
            <p className="text-sm text-primary-foreground/80">Your wellness companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-fade-in ${
              message.isBot ? 'justify-start' : 'justify-end'
            }`}
          >
            {message.isBot && (
              <div className="w-8 h-8 bg-gradient-mint rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            
            <Card className={`max-w-xs shadow-soft border-0 ${
              message.isBot 
                ? 'bg-card' 
                : 'bg-gradient-calm text-primary-foreground'
            }`}>
              <CardContent className="p-3">
                <p className={`text-sm leading-relaxed ${
                  message.isBot ? 'text-foreground' : 'text-primary-foreground'
                }`}>
                  {message.text}
                </p>
                <p className={`text-xs mt-2 ${
                  message.isBot ? 'text-muted-foreground' : 'text-primary-foreground/70'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </CardContent>
            </Card>

            {!message.isBot && (
              <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3 animate-fade-in">
            <div className="w-8 h-8 bg-gradient-mint rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <Card className="shadow-soft border-0 bg-card">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Responses */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickResponses.map((response, index) => (
            <Button
              key={index}
              onClick={() => sendMessage(response)}
              size="sm"
              variant="outline"
              className="rounded-full border-border/50 hover:bg-accent/50 text-xs"
            >
              {response}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-2xl border-border/50 focus:border-primary"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="w-12 h-12 rounded-full bg-gradient-calm hover:shadow-soft transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;