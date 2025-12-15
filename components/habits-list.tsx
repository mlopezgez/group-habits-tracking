import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import Link from "next/link"

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
  }>
  isAdmin: boolean
}

export function HabitsList({ groupId, habits, isAdmin }: HabitsListProps) {
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
        {habits.map((habit) => (
          <Link key={habit.id} href={`/groups/${groupId}/habits/${habit.id}`}>
            <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-3 flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: habit.color || "oklch(0.55 0.22 262)" }}
                >
                  {habit.icon || "🎯"}
                </div>
              </div>
              <h3 className="mb-2 font-semibold group-hover:text-primary">{habit.name}</h3>
              {habit.description && <p className="line-clamp-2 text-sm text-muted-foreground">{habit.description}</p>}
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="capitalize">{habit.frequency}</span> • {habit.targetDays}x per week
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
