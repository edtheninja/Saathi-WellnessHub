import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { AlertTriangle, Phone } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const apiBase = import.meta.env.VITE_API_URL || "/api";

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
  const [showSupport, setShowSupport] = useState(false);

  const quickResponses = [
    "I'm feeling anxious",
    "I had a good day",
    "I'm struggling today",
    "Tell me about meditation",
    "I need motivation"
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const safetySignal = /suicide|kill myself|self[- ]harm|hurt myself|end my life|can't go on/i.test(text);
    if (safetySignal) setShowSupport(true);

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

    try {
      const token = localStorage.getItem("saathi_access_token");
      const response = await fetch(`${apiBase}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((message) => ({
              role: message.isBot ? "assistant" : "user",
              content: message.text,
            })),
            { role: "user", content: text },
          ],
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "AI response failed");
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: payload.message,
        isBot: true,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: "I am having trouble connecting right now. Please take a slow breath and try again in a moment.",
        isBot: true,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
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
      {showSupport && (
        <div className="mx-4 mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="space-y-2">
              <p className="text-sm font-semibold">You deserve immediate human support.</p>
              <p className="text-xs text-muted-foreground">Saathi is not emergency care. If you may hurt yourself, contact local emergency services or Tele-MANAS now.</p>
              <a href="tel:14416" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white">
                <Phone className="h-4 w-4" /> Call Tele-MANAS 14416
              </a>
            </div>
          </div>
        </div>
      )}

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