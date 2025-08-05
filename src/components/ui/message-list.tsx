import React from "react"

import { ChatMessage, type ChatMessageProps, type Message } from "@/components/ui/chat-message"

interface TypingIndicatorProps {
  className?: string
}

const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className="flex gap-3"
      >
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-muted shadow">
          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
        </div>
      </div>
    )
  }
)

TypingIndicator.displayName = "TypingIndicator"

interface MessageListProps {
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  messageOptions?:
    | Omit<ChatMessageProps, keyof Message>
    | ((message: Message) => Omit<ChatMessageProps, keyof Message>)
}

const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  (
    { messages, showTimeStamps = true, isTyping = false, messageOptions },
    ref
  ) => {
    return (
      <div ref={ref} className="space-y-4 overflow-visible">
        {messages.map((message, index) => {
          const additionalOptions =
            typeof messageOptions === "function"
              ? messageOptions(message)
              : messageOptions

          return (
            <ChatMessage
              key={message.id}
              showTimeStamp={showTimeStamps}
              {...message}
              {...additionalOptions}
            />
          )
        })}
        {isTyping && <TypingIndicator />}
      </div>
    )
  }
)

MessageList.displayName = "MessageList"

export { MessageList, TypingIndicator }
