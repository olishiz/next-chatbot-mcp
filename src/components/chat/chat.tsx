"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { MessageList } from "@/components/ui/message-list"
import { MessageInput } from "@/components/ui/message-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Zap, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

interface ChatProps {
  className?: string
}

export function Chat({ className }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  
  // Initialize with welcome message on client side only
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Hello! I'm your Enterprise AI Assistant with MongoDB and shadcn/ui integration. How can I help you today?",
          createdAt: new Date(),
        },
      ])
    }
  }, [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mongoStatus, setMongoStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [mcpStatus, setMcpStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Check connection statuses
  useEffect(() => {
    const checkMongoStatus = async () => {
      try {
        const response = await fetch("/api/mongo-status")
        if (response.ok) {
          setMongoStatus("connected")
        } else {
          setMongoStatus("disconnected")
        }
      } catch {
        setMongoStatus("disconnected")
      }
    }
    
    const checkMcpStatus = async () => {
      try {
        // For now, we'll assume the MCP server is running since we started it
        // In a real implementation, you might want to check a specific endpoint
        setMcpStatus("connected")
      } catch {
        setMcpStatus("disconnected")
      }
    }
    
    checkMongoStatus()
    checkMcpStatus()
  }, [])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { 
            id: Date.now().toString(),
            role: "user", 
            content: userMessage, 
            createdAt: new Date() 
          }],
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    try {
      const botResponseContent = await getBotResponse(input)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponseContent,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleStop = () => {
    // In a real implementation, you would stop the generation here
    setIsLoading(false)
  }
  
  // Quick action suggestions
  const quickActions = [
    { text: "Summarize data", prompt: "Can you summarize the key insights from my MongoDB data?" },
    { text: "Suggest UI", prompt: "Recommend a dashboard UI using shadcn/ui components" },
    { text: "Analyze trends", prompt: "What trends do you see in my data?" },
  ]
  
  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
    // Focus on input and send automatically
    setTimeout(() => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const inputElement = document.querySelector('textarea');
      if (inputElement) {
        inputElement.dispatchEvent(event);
      }
    }, 100);
  }
  
  return (
    <Card className={cn("flex flex-col h-[700px] w-full max-w-4xl mx-auto shadow-xl border-0 bg-gradient-to-br from-amber-50 to-yellow-50", className)}>
      {/* Header with cleaner design */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-md border border-amber-300 bg-amber-100 text-amber-800">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Enterprise AI Assistant</CardTitle>
            <p className="text-xs text-amber-200">Powered by Claude 3.5 Sonnet</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            <Badge 
              variant={mongoStatus === "connected" ? "default" : "destructive"}
              className={cn("text-xs px-2 py-0.5", mongoStatus === "connected" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}
            >
              {mongoStatus === "connected" ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4" />
            <Badge 
              variant={mcpStatus === "connected" ? "default" : "destructive"}
              className={cn("text-xs px-2 py-0.5", mcpStatus === "connected" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}
            >
              {mcpStatus === "connected" ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <MessageList 
            messages={messages} 
            isTyping={isLoading}
            showTimeStamps={true}
          />
          <div ref={messagesEndRef} />
        </div>
        
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
                {action.text}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-6 bg-white border-t border-amber-100 rounded-b-lg">
          <form onSubmit={handleSubmit}>
            <MessageInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              isGenerating={isLoading}
              stop={handleStop}
              submitOnEnter={true}
              placeholder="Ask me anything about your data, UI components, or enterprise needs..."
              className="border-amber-200 focus-within:border-amber-500 focus-within:ring-amber-500"
            />
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
