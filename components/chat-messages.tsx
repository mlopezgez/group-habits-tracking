"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, isToday, isYesterday } from "date-fns"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  createdAt: string
  userId: string
  name: string | null
  profileImage: string | null
  email: string
}

interface ChatMessagesProps {
  messages: Message[]
  currentUserId: string
}

export function ChatMessages({ messages: initialMessages, currentUserId }: ChatMessagesProps) {
  const [messages, setMessages] = useState(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Scroll to bottom on initial load
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" })
  }, [])

  useEffect(() => {
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      router.refresh()
    }, 3000)

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    setMessages(initialMessages)
    // Scroll to bottom when new messages arrive
    if (initialMessages.length > messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [initialMessages])

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, "h:mm a")
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`
    } else {
      return format(date, "MMM d, h:mm a")
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
          <div>
            <p className="mb-1 font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation below</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.userId === currentUserId
            const showAvatar = index === 0 || messages[index - 1].userId !== message.userId

            return (
              <div key={message.id} className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                {showAvatar ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.profileImage || "/placeholder.svg"} alt={message.name || "User"} />
                    <AvatarFallback>{message.name?.[0] || message.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8" />
                )}
                <div className={`flex flex-col gap-1 ${isCurrentUser ? "items-end" : "items-start"}`}>
                  {showAvatar && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {isCurrentUser ? "You" : message.name || message.email}
                    </span>
                  )}
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2 ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatMessageTime(message.createdAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
