import { useState, useEffect, useRef } from 'react';
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Trash2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QUICK_QUESTIONS = [
  { id: 1, text: "Government Schemes", question: "What government schemes are available for farmers in India?" },
  { id: 2, text: "Crop Diseases", question: "How do I identify and treat common crop diseases?" },
  { id: 3, text: "Market Prices", question: "How can I get the best market prices for my crops?" },
  { id: 4, text: "Soil Health", question: "How do I improve soil health and fertility?" },
  { id: 5, text: "Modern Farming", question: "What modern farming techniques should I adopt?" },
  { id: 6, text: "Irrigation Tips", question: "What are the best irrigation practices for water conservation?" },
];

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-muted rounded-2xl rounded-bl-sm w-fit">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const Chatbot = () => {
  // Persist messages to localStorage
  const [messages, setMessages] = usePersistedState<ChatMessage[]>('agrithrive-chat-messages', []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  const avatars = {
    user: "/image2.png",
    assistant: "/image1.png"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Add welcome message only if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Hello! I'm AgriBot 🌾, your agricultural assistant. I'm here to help you with farming advice, government schemes, market information, and more. How can I assist you today?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Hide quick questions if there are more than just the welcome message
  useEffect(() => {
    if (messages.length > 1) {
      setShowQuickQuestions(false);
    }
  }, [messages]);

  const sendMessage = async (messageText: string | null = null) => {
    const userMessage = messageText || input.trim();

    if (!userMessage) return;

    setShowQuickQuestions(false);

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const recentMessages = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: recentMessages
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });

      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (questionText: string) => {
    sendMessage(questionText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `Hello! I'm AgriBot 🌾, your agricultural assistant. I'm here to help you with farming advice, government schemes, market information, and more. How can I assist you today?`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    setShowQuickQuestions(true);
    toast({
      title: "Chat Cleared",
      description: "Your conversation has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto px-4 pt-20 pb-4 flex flex-col">
        <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AgriBot Assistant</h1>
                <p className="text-muted-foreground text-sm">Your 24/7 agricultural expert companion</p>
              </div>
            </div>
            {messages.length > 1 && (
              <Button variant="outline" size="sm" onClick={clearChat} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </Button>
            )}
          </div>

          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="w-5 h-5 text-primary" />
                <span>Chat with AgriBot</span>
                <Badge variant="secondary" className="ml-auto">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={message.role === 'user' ? avatars.user : avatars.assistant}
                      alt={message.role === 'user' ? "User Avatar" : "Bot Avatar"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className={`flex flex-col gap-1 max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : message.isError
                            ? 'bg-destructive/10 text-destructive rounded-bl-sm'
                            : 'bg-muted rounded-bl-sm'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground px-2">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-muted border-2 border-primary/20">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <TypingIndicator />
                </div>
              )}

              {showQuickQuestions && messages.length === 1 && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    Or choose a quick topic to get started:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <Button
                        key={q.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(q.question)}
                        className="h-auto py-3 px-4 text-left justify-start hover:bg-primary/5 hover:border-primary/50 transition-all"
                        disabled={isLoading}
                      >
                        <span className="text-sm font-medium">{q.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t bg-muted/30 p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 bg-background"
                  autoFocus
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-10 w-10"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                AgriBot provides general agricultural advice. Always consult local experts for specific situations.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;