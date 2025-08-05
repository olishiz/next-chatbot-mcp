"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Database, Zap, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your Enterprise AI Assistant with MongoDB and shadcn/ui integration. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mongoStatus, setMongoStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [mcpStatus, setMcpStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check MongoDB connection status
    const checkMongoStatus = async () => {
      try {
        const response = await fetch("/api/mongo-status");
        if (response.ok) {
          setMongoStatus("connected");
        } else {
          setMongoStatus("disconnected");
        }
      } catch {
        setMongoStatus("disconnected");
      }
    };
    
    // Check shadcn/ui MCP server status
    const checkMcpStatus = async () => {
      try {
        const response = await fetch("/api/mcp-status");
        if (response.ok) {
          setMcpStatus("connected");
        } else {
          setMcpStatus("disconnected");
        }
      } catch {
        setMcpStatus("disconnected");
      }
    };
    
    checkMongoStatus();
    checkMcpStatus();
  }, []);

  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { content: userMessage, sender: "user" }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        if (errorData.details) {
          return `I'm sorry, I encountered an error: ${errorData.details}`;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error: any) {
      console.error("Error getting bot response:", error);
      if (error.message) {
        return `I'm sorry, I encountered an error: ${error.message}`;
      }
      return "I'm sorry, I encountered an error processing your request. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const botResponseContent = await getBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseContent,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action suggestions
  const quickActions = [
    { icon: <Zap className="w-4 h-4" />, text: "Summarize data", prompt: "Can you summarize the key insights from my MongoDB data?" },
    { icon: <Lightbulb className="w-4 h-4" />, text: "Suggest UI", prompt: "Recommend a dashboard UI using shadcn/ui components" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "Analyze trends", prompt: "What trends do you see in my data?" },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    // Focus on input and send automatically
    setTimeout(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const inputElement = document.querySelector('input');
      if (inputElement) {
        inputElement.dispatchEvent(event);
      }
    }, 100);
  };

  return (
    <Card className="flex flex-col h-[700px] w-full max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-amber-50 to-yellow-50">
      {/* Header with Maybank theme */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-amber-300 bg-amber-100 text-amber-800">
            <AvatarFallback className="bg-amber-100 text-amber-800">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold">Enterprise AI Assistant</h2>
            <p className="text-xs text-amber-200">Powered by Claude 3.5 Sonnet</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  <Badge 
                    variant={mongoStatus === "connected" ? "default" : "destructive"}
                    className={`text-xs ${mongoStatus === "connected" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    {mongoStatus === "connected" ? "MongoDB" : "MongoDB"}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>MongoDB Connection: {mongoStatus}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 ml-2">
                  <Zap className="w-4 h-4" />
                  <Badge 
                    variant={mcpStatus === "connected" ? "default" : "destructive"}
                    className={`text-xs ${mcpStatus === "connected" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    {mcpStatus === "connected" ? "MCP" : "MCP"}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>shadcn/ui MCP Server: {mcpStatus}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      {/* Messages Area with Maybank theme */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full px-6 py-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="w-9 h-9 border-2 border-white shadow-md">
                  <AvatarFallback
                    className={message.sender === "bot" 
                      ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white" 
                      : "bg-gradient-to-br from-amber-700 to-amber-800 text-white"
                    }
                  >
                    {message.sender === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.sender === "bot" 
                      ? "bg-white border border-amber-100 text-amber-900" 
                      : "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "bot" ? "text-amber-600" : "text-amber-100"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar className="w-9 h-9 border-2 border-white shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-amber-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-sm text-amber-700">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Quick Actions */}
      <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-100"
              onClick={() => handleQuickAction(action.prompt)}
            >
              {action.icon}
              <span className="ml-1">{action.text}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Input Area with Maybank theme */}
      <div className="p-6 bg-white border-t border-amber-100 rounded-b-lg">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your data, UI components, or enterprise needs..."
            disabled={isLoading}
            className="flex-1 h-12 px-4 text-sm border-amber-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading}
            size="lg"
            className="h-12 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl shadow-md transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
