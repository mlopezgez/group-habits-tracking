import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HabitTracker } from "@/components/habit-tracker"
import { HabitProgress } from "@/components/habit-progress"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ groupId: string; habitId: string }>
}

export default async function HabitDetailPage({ params }: PageProps) {
  const { userId } = await auth()
  const { groupId, habitId } = await params

  if (!userId) {
    redirect("/sign-in")
  }

  const users = await sql`SELECT * FROM "User" WHERE "clerkId" = ${userId}`
  const user = users[0]

  if (!user) {
    redirect("/sign-in")
  }

  // Check if user is a member
  const memberships = await sql`
    SELECT * FROM "GroupMember" 
    WHERE "userId" = ${user.id} AND "groupId" = ${groupId}
  `

  if (memberships.length === 0) {
    redirect("/dashboard")
  }

  // Get habit details
  const habits = await sql`
    SELECT h.*, g.name as group_name
    FROM "Habit" h
    JOIN "Group" g ON h."groupId" = g.id
    WHERE h.id = ${habitId} AND h."groupId" = ${groupId}
  `

  if (habits.length === 0) {
    redirect(`/groups/${groupId}`)
  }

  const habit = habits[0]

  // Get user's check-ins for this habit (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const checkIns = await sql`
    SELECT * FROM "CheckIn"
    WHERE "habitId" = ${habitId} 
      AND "userId" = ${user.id}
      AND date >= ${thirtyDaysAgo.toISOString()}
    ORDER BY date DESC
  `

  // Get all members' check-ins for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayCheckIns = await sql`
    SELECT c.*, u.name, u."profileImage"
    FROM "CheckIn" c
    JOIN "User" u ON c."userId" = u.id
    WHERE c."habitId" = ${habitId}
      AND DATE(c.date) = DATE(${today.toISOString()})
    ORDER BY c."createdAt" DESC
  `

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {habit.group_name}
          </Link>
        </Button>

        <Card className="mb-6 border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
              style={{ backgroundColor: habit.color || "oklch(0.55 0.22 262)" }}
            >
              {habit.icon || "🎯"}
            </div>
            <div className="flex-1">
              <h1 className="text-balance text-2xl font-bold tracking-tight">{habit.name}</h1>
              {habit.description && <p className="mt-2 text-muted-foreground">{habit.description}</p>}
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="capitalize">{habit.frequency}</span> • Goal: {habit.targetDays}x per week
              </div>
              <Button variant="link" asChild className="mt-2 h-auto p-0 text-sm">
                <Link href={`/groups/${groupId}/habits/${habitId}/checkins`}>View all check-ins →</Link>
              </Button>
            </div>
          </div>
        </Card>

        <HabitTracker
          habitId={habitId}
          groupId={groupId}
          userId={user.id}
          checkIns={checkIns}
          todayCheckIns={todayCheckIns}
        />

        <HabitProgress habitId={habitId} userId={user.id} targetDays={habit.targetDays} checkIns={checkIns} />
      </div>
    </div>
  )
}
