import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Send,
  Bot,
  User,
  AlertTriangle,
  Phone,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const ChatDoodles = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Top-right heart and wave */}
      <svg
        className="absolute right-4 top-5 h-24 w-56 text-primary/25"
        viewBox="0 0 240 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 62C48 43 76 76 104 53C132 30 142 19 153 32C166 48 146 76 132 67C112 53 137 12 155 23C178 37 154 73 177 70C196 67 204 50 226 57"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M143 30C130 14 113 24 116 39C119 54 143 66 143 66C143 66 168 48 168 32C168 18 151 17 143 30Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Top-left sparkle */}
      <svg
        className="absolute left-3 top-36 h-20 w-20 text-primary/30"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 10L44 31L65 35L44 40L40 62L35 40L14 35L35 31L40 10Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Fox doodle */}
      <svg
        className="absolute right-5 top-28 h-36 w-36 text-primary/30"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M48 57L43 23L67 39C77 34 88 34 98 39L122 23L117 58C127 70 130 87 124 103C117 124 99 135 80 135C61 135 43 124 36 103C30 87 33 70 48 57Z"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M43 23L67 39L57 59L43 23Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <path
          d="M122 23L98 39L108 59L122 23Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <path
          d="M55 82C61 75 70 75 76 82"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M84 82C90 75 99 75 105 82"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M80 88L75 94H85L80 88Z"
          fill="currentColor"
          fillOpacity="0.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M80 94C76 103 66 103 63 96M80 94C84 103 94 103 97 96"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          d="M42 111C28 111 23 123 31 132C39 141 54 135 60 126"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M111 111C126 108 138 116 135 127C132 139 115 139 104 128"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M70 111C74 115 86 115 90 111"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          d="M24 61L16 56M21 70L11 70M24 79L16 84"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          d="M136 61L144 56M139 70L149 70M136 79L144 84"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Left leaves */}
      <svg
        className="absolute -left-2 top-[340px] h-32 w-24 text-primary/25"
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 132C42 113 43 79 45 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M43 65C23 63 13 49 19 34C37 37 45 49 43 65Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M44 84C62 83 77 70 73 54C56 57 45 69 44 84Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M43 105C26 104 17 94 20 82C35 82 43 92 43 105Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M44 116C60 117 73 109 75 97C59 94 47 104 44 116Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>

      {/* Middle-left sparkle */}
      <svg
        className="absolute left-24 top-[440px] h-12 w-12 text-primary/25"
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 3L29 20L46 25L29 29L25 46L20 29L3 25L20 20L25 3Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Heart near messages */}
      <svg
        className="absolute left-[52%] top-[570px] h-16 w-16 text-primary/30"
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M35 58C30 53 10 40 10 24C10 10 27 7 35 21C43 7 60 10 60 24C60 40 40 53 35 58Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M4 62C17 62 20 55 25 48"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Right leaves */}
      <svg
        className="absolute -right-2 bottom-72 h-40 w-28 text-primary/25"
        viewBox="0 0 110 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M52 153C54 115 63 83 83 37"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M65 91C44 91 33 77 38 62C55 64 65 76 65 91Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M69 72C88 73 102 61 98 46C82 47 70 58 69 72Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M56 117C37 117 26 104 31 90C47 92 57 103 56 117Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M78 53C64 48 60 34 68 23C81 30 85 42 78 53Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M49 137C34 137 24 128 27 117C40 119 49 127 49 137Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>

      {/* Bottom-left lotus */}
      <svg
        className="absolute bottom-20 left-0 h-28 w-28 text-primary/20"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M60 103C60 83 46 65 28 60C30 81 43 98 60 103Z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M60 103C60 83 74 65 92 60C90 81 77 98 60 103Z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M60 96C43 83 38 65 45 48C58 60 64 78 60 96Z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M60 96C77 83 82 65 75 48C62 60 56 78 60 96Z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M60 88C47 76 46 57 60 40C74 57 73 76 60 88Z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        <path
          d="M25 105H95"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Small right sparkle */}
      <svg
        className="absolute right-24 bottom-96 h-8 w-8 text-primary/20"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 2L24 16L38 20L24 24L20 38L16 24L2 20L16 16L20 2Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm SAATHI, your AI wellness companion. I'm here to listen and support you on your mental health journey. How are you feeling today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [showSupport, setShowSupport] = useState(false);

  const quickResponses = [
    "I'm feeling anxious",
    "I had a good day",
    "I'm struggling today",
    "Tell me about meditation",
    "I need motivation",
  ];

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText || isTyping) return;

    // Detect messages that may indicate immediate safety concerns.
    const safetySignal =
      /suicide|kill myself|self[- ]harm|hurt myself|end my life|can't go on/i.test(
        trimmedText
      );

    if (safetySignal) {
      setShowSupport(true);
    }

    // Save the current conversation BEFORE adding the new user message.
    const conversationHistory = messages.map((message) => ({
      role: message.isBot ? "assistant" : "user",
      content: message.text,
    }));

    const userMessage: Message = {
      id: Date.now(),
      text: trimmedText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setInputText("");

    setIsTyping(true);

    try {
      const token = localStorage.getItem("saathi_access_token");

      const response = await fetch(`${apiBase}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          messages: [
            ...conversationHistory,
            {
              role: "user",
              content: trimmedText,
            },
          ],
        }),
      });

      /*
       * IMPORTANT:
       * Do not blindly call response.json().
       *
       * If Vercel returns index.html instead of your backend JSON,
       * the response starts with "<!DOCTYPE html>" and response.json()
       * throws:
       *
       * Unexpected token '<'
       */

      const contentType = response.headers.get("content-type") || "";

      let payload: {
        message?: string;
        error?: string;
      } = {};

      if (contentType.includes("application/json")) {
        payload = await response.json().catch(() => ({}));
      } else {
        const rawResponse = await response.text();

        console.error("Backend returned non-JSON response:", {
          status: response.status,
          statusText: response.statusText,
          response: rawResponse.slice(0, 500),
        });

        throw new Error(
          `Backend returned ${response.status} ${response.statusText} instead of JSON`
        );
      }

      if (!response.ok) {
        throw new Error(payload.error || "AI response failed");
      }

      if (!payload.message) {
        throw new Error("AI returned an empty response");
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: payload.message,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("AI chat error:", error);

      const errorMessage =
        "I am having trouble connecting right now. Please take a slow breath and try again in a moment.";

      if (error instanceof Error) {
        console.error("AI chat error message:", error.message);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: errorMessage,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || isTyping) return;

    sendMessage(inputText);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background pb-24">
      <ChatDoodles />

      {/* Header */}
      <div className="relative z-10 bg-gradient-calm px-6 py-4 shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground">
            <Bot className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-primary-foreground">
              SAATHI AI
            </h1>

            <p className="text-sm text-primary-foreground/80">
              Your wellness companion
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-fade-in ${
              message.isBot ? "justify-start" : "justify-end"
            }`}
          >
            {/* Bot Avatar */}
            {message.isBot && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-mint">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
            )}

            {/* Message */}
            <Card
              className={`max-w-xs border-0 shadow-soft ${
                message.isBot
                  ? "bg-card"
                  : "bg-gradient-calm text-primary-foreground"
              }`}
            >
              <CardContent className="p-3">
                <p
                  className={`text-sm leading-relaxed ${
                    message.isBot
                      ? "text-foreground"
                      : "text-primary-foreground"
                  }`}
                >
                  {message.text}
                </p>

                <p
                  className={`mt-2 text-xs ${
                    message.isBot
                      ? "text-muted-foreground"
                      : "text-primary-foreground/70"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>

            {/* User Avatar */}
            {!message.isBot && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-ocean">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3 animate-fade-in">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-mint">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>

            <Card className="border-0 bg-card shadow-soft">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />

                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                    style={{ animationDelay: "0.1s" }}
                  />

                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Safety Support */}
      {showSupport && (
        <div className="relative z-10 mx-4 mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

            <div className="space-y-2">
              <p className="text-sm font-semibold">
                You deserve immediate human support.
              </p>

              <p className="text-xs text-muted-foreground">
                Saathi is not emergency care. If you may hurt yourself,
                contact local emergency services or Tele-MANAS now.
              </p>

              <a
                href="tel:14416"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white"
              >
                <Phone className="h-4 w-4" />
                Call Tele-MANAS 14416
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Responses */}
      <div className="relative z-10 px-4 pb-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {quickResponses.map((response, index) => (
            <Button
              key={index}
              onClick={() => sendMessage(response)}
              size="sm"
              variant="outline"
              disabled={isTyping}
              className="rounded-full border-border/50 text-xs hover:bg-accent/50"
            >
              {response}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 pb-4">
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
            className="h-12 w-12 rounded-full bg-gradient-calm transition-all duration-300 hover:shadow-soft"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;