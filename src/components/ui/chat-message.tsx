"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Bot, User } from "lucide-react"

import { cn } from "@/lib/utils"

const chatBubbleVariants = cva(
  "group/message relative break-words rounded-lg p-3 text-sm sm:max-w-[70%]",
  {
    variants: {
      isUser: {
        true: "bg-amber-500 text-white ml-auto",
        false: "bg-muted text-foreground mr-auto",
      },
      animation: {
        none: "",
        slide: "duration-300 animate-in fade-in-0",
        scale: "duration-300 animate-in fade-in-0 zoom-in-75",
        fade: "duration-500 animate-in fade-in-0",
      },
    },
    compoundVariants: [
      {
        isUser: true,
        animation: "slide",
        class: "slide-in-from-right",
      },
      {
        isUser: false,
        animation: "slide",
        class: "slide-in-from-left",
      },
      {
        isUser: true,
        animation: "scale",
        class: "origin-bottom-right",
      },
      {
        isUser: false,
        animation: "scale",
        class: "origin-bottom-left",
      },
    ],
    defaultVariants: {
      isUser: false,
      animation: "scale",
    },
  }
)

type Animation = "none" | "slide" | "scale" | "fade"

interface Attachment {
  name?: string
  contentType?: string
  url: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: Date
  experimental_attachments?: Attachment[]
}

interface ChatMessageProps extends Message {
  showTimeStamp?: boolean
  animation?: Animation
  actions?: React.ReactNode
  className?: string
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      role,
      content,
      createdAt = new Date(),
      showTimeStamp = false,
      animation = "scale",
      actions,
      className,
      ...props
    },
    ref
  ) => {
    const isUser = role === "user"

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3",
          isUser ? "flex-row-reverse" : "flex-row",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
            isUser ? "bg-amber-500 text-white" : "bg-muted"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className="flex flex-col gap-1">
          <motion.div
            className={cn(chatBubbleVariants({ isUser, animation }))}
            layout
          >
            <div className="whitespace-pre-wrap">{content}</div>
            {actions}
          </motion.div>
          {showTimeStamp && (
            <div
              className={cn(
                "text-xs text-muted-foreground",
                isUser ? "text-right" : "text-left"
              )}
            >
              {createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
)

ChatMessage.displayName = "ChatMessage"

export { ChatMessage, type ChatMessageProps, type Message }
