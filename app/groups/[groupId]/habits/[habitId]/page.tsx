import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HabitTracker } from "@/components/habit-tracker"
import { HabitProgress } from "@/components/habit-progress"
import { JoinHabitButton } from "@/components/join-habit-button"
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

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Check if user is a member
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: groupId,
      },
    },
  })

  if (!membership) {
    redirect("/dashboard")
  }

  // Get habit details with tracking status
  const habit = await prisma.habit.findUnique({
    where: {
      id: habitId,
      groupId: groupId,
    },
    include: {
      group: {
        select: {
          name: true,
        },
      },
      userHabits: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      },
    },
  })

  if (!habit) {
    redirect(`/groups/${groupId}`)
  }

  const isTracking = habit.userHabits.length > 0

  // Get user's check-ins for this habit (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const checkIns = await prisma.checkIn.findMany({
    where: {
      habitId: habitId,
      userId: user.id,
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      date: "desc",
    },
  })

  // Get all members' check-ins for today (only from users tracking this habit)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  // Get users tracking this habit
  const trackingUsers = await prisma.userHabit.findMany({
    where: {
      habitId: habitId,
    },
    select: {
      userId: true,
    },
  })

  const trackingUserIds = trackingUsers.map((uh: { userId: string }) => uh.userId)

  const todayCheckIns = await prisma.checkIn.findMany({
    where: {
      habitId: habitId,
      userId: {
        in: trackingUserIds,
      },
      date: {
        gte: today,
        lte: endOfToday,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {habit.group.name}
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
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-balance text-2xl font-bold tracking-tight">{habit.name}</h1>
                  {habit.description && <p className="mt-2 text-muted-foreground">{habit.description}</p>}
                  <div className="mt-3 text-sm text-muted-foreground">
                    <span className="capitalize">{habit.frequency}</span> • Goal: {habit.targetDays}x per week
                  </div>
                </div>
                {!isTracking && (
                  <JoinHabitButton groupId={groupId} habitId={habitId} />
                )}
              </div>
              <Button variant="link" asChild className="mt-2 h-auto p-0 text-sm">
                <Link href={`/groups/${groupId}/habits/${habitId}/checkins`}>View all check-ins →</Link>
              </Button>
            </div>
          </div>
        </Card>

        {isTracking ? (
          <>
            <HabitTracker
              habitId={habitId}
              groupId={groupId}
              userId={user.id}
              checkIns={checkIns.map((ci: typeof checkIns[0]) => ({
                id: ci.id,
                date: ci.date.toISOString(),
                note: ci.note,
                photoUrl: ci.photoUrl,
              }))}
              todayCheckIns={todayCheckIns.map((ci: typeof todayCheckIns[0]) => ({
                id: ci.id,
                name: ci.user.name,
                profileImage: ci.user.profileImage,
                createdAt: ci.createdAt.toISOString(),
                note: ci.note,
                photoUrl: ci.photoUrl,
              }))}
            />

            <HabitProgress habitId={habitId} userId={user.id} targetDays={habit.targetDays} checkIns={checkIns.map((ci: typeof checkIns[0]) => ({
              id: ci.id,
              date: ci.date.toISOString(),
              note: ci.note,
              photoUrl: ci.photoUrl,
            }))} />
          </>
        ) : (
          <Card className="border-border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">
              You're not tracking this habit yet. Join it to start checking in and see your progress!
            </p>
            <JoinHabitButton groupId={groupId} habitId={habitId} />
          </Card>
        )}
      </div>
    </div>
  )
}
