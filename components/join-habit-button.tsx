"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"

interface JoinHabitButtonProps {
  groupId: string
  habitId: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function JoinHabitButton({ groupId, habitId, variant = "default", size = "default" }: JoinHabitButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/habits/${habitId}/join`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to join habit")
      }

      router.refresh()
    } catch (error) {
      console.error("Error joining habit:", error)
      alert(error instanceof Error ? error.message : "Failed to join habit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={loading}
      variant={variant}
      size={size}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Join Habit
        </>
      )}
    </Button>
  )
}
