"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp, Square } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface MessageInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  submitOnEnter?: boolean
  stop?: () => void
  isGenerating: boolean
  enableInterrupt?: boolean
}

const MessageInput = React.forwardRef<HTMLTextAreaElement, MessageInputProps>(
  (
    {
      placeholder = "Type a message...",
      className,
      onKeyDown: onKeyDownProp,
      submitOnEnter = true,
      stop,
      isGenerating,
      enableInterrupt = true,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
      if (textareaRef.current) {
        // Auto-resize textarea
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          150
        )}px`
      }
    }, [props.value])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (onKeyDownProp) {
        onKeyDownProp(e)
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (submitOnEnter && props.value.trim()) {
          e.preventDefault()
          // Submit will be handled by parent component
        }
      }
    }

    return (
      <div
        className={cn(
          "relative flex flex-col gap-3 rounded-xl border bg-background p-2 shadow-sm transition-all duration-300",
          className
        )}
      >
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          className="min-h-[40px] max-h-[150px] w-full resize-none border-0 p-0 shadow-none focus-visible:ring-0"
          onKeyDown={handleKeyDown}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Additional buttons can be added here */}
          </div>
          <div className="flex items-center gap-1">
            <AnimatePresence>
              {isGenerating && enableInterrupt && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={stop}
                    aria-label="Stop generation"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </motion.div>
              )
              }
            </AnimatePresence>
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 rounded-full bg-amber-500 hover:bg-amber-600"
              disabled={!props.value.trim() || isGenerating}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

MessageInput.displayName = "MessageInput"

export { MessageInput }
