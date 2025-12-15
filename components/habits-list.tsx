"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface HabitsListProps {
  groupId: string
  habits: Array<{
    id: string
    name: string
    description: string | null
    frequency: string
    targetDays: number
    icon: string | null
    color: string | null
    isTracking: boolean
  }>
  isAdmin: boolean
}

export function HabitsList({ groupId, habits, isAdmin }: HabitsListProps) {
  const router = useRouter()
  const [loadingHabits, setLoadingHabits] = useState<Set<string>>(new Set())

  const handleToggleHabit = async (habitId: string, isTracking: boolean) => {
    setLoadingHabits((prev) => new Set(prev).add(habitId))
    try {
      const response = await fetch(`/api/groups/${groupId}/habits/${habitId}/join`, {
        method: isTracking ? "DELETE" : "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update habit")
      }

      router.refresh()
    } catch (error) {
      console.error("Error toggling habit:", error)
      alert(error instanceof Error ? error.message : "Failed to update habit. Please try again.")
    } finally {
      setLoadingHabits((prev) => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      })
    }
  }

  if (habits.length === 0) {
    return (
      <Card className="border-border bg-card p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No habits yet</h3>
        <p className="mb-6 text-muted-foreground">
          {isAdmin ? "Create your first habit to get started" : "Waiting for admin to create habits"}
        </p>
        {isAdmin && (
          <Button asChild>
            <Link href={`/groups/${groupId}/habits/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Habit
            </Link>
          </Button>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href={`/groups/${groupId}/habits/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const isLoading = loadingHabits.has(habit.id)
          return (
            <Card
              key={habit.id}
              className={`group relative border-border bg-card p-6 transition-all ${
                habit.isTracking
                  ? "border-primary/50 shadow-lg shadow-primary/5"
                  : "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: habit.color || "oklch(0.55 0.22 262)" }}
                >
                  {habit.icon || "🎯"}
                </div>
                {habit.isTracking && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Tracking
                  </Badge>
                )}
              </div>
              <h3 className="mb-2 font-semibold group-hover:text-primary">{habit.name}</h3>
              {habit.description && <p className="line-clamp-2 text-sm text-muted-foreground">{habit.description}</p>}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="capitalize">{habit.frequency}</span> • {habit.targetDays}x per week
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {habit.isTracking ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.preventDefault()
                        handleToggleHabit(habit.id, true)
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Leaving...
                        </>
                      ) : (
                        "Leave Habit"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/groups/${groupId}/habits/${habit.id}`}>View</Link>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault()
                      handleToggleHabit(habit.id, false)
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Habit"
                    )}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
