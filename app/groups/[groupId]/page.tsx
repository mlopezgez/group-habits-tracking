import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GroupSettings } from "@/components/group-settings"
import { HabitsList } from "@/components/habits-list"
import Link from "next/link"
import { ArrowLeft, Users, MessageCircle } from "lucide-react"
import { ShareInviteDialog } from "@/components/share-invite-dialog"

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupPage({ params }: PageProps) {
  const { userId } = await auth()
  const { groupId } = await params

  if (!userId) {
    redirect("/sign-in")
  }

  const users = await sql`SELECT * FROM "User" WHERE "clerkId" = ${userId}`
  const user = users[0]

  if (!user) {
    redirect("/sign-in")
  }

  // Get group details
  const groups = await sql`
    SELECT g.*, u.name as owner_name
    FROM "Group" g
    LEFT JOIN "User" u ON g."ownerId" = u.id
    WHERE g.id = ${groupId}
  `

  if (groups.length === 0) {
    redirect("/dashboard")
  }

  const group = groups[0]

  // Check if user is a member
  const memberships = await sql`
    SELECT * FROM "GroupMember" 
    WHERE "userId" = ${user.id} AND "groupId" = ${groupId}
  `

  if (memberships.length === 0) {
    redirect("/dashboard")
  }

  const membership = memberships[0]
  const isAdmin = membership.role === "admin"

  // Get all members
  const members = await sql`
    SELECT gm.*, u.name, u.email, u."profileImage"
    FROM "GroupMember" gm
    JOIN "User" u ON gm."userId" = u.id
    WHERE gm."groupId" = ${groupId}
    ORDER BY gm."joinedAt" ASC
  `

  // Get active habits with user tracking status
  const habits = await prisma.habit.findMany({
    where: {
      groupId: groupId,
      isActive: true,
    },
    include: {
      userHabits: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Transform habits to include isTracking flag
  const habitsWithTracking = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    targetDays: habit.targetDays,
    icon: habit.icon,
    color: habit.color,
    isTracking: habit.userHabits.length > 0,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight">{group.name}</h1>
          {group.description && <p className="mt-2 text-muted-foreground">{group.description}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{members.length} members</span>
            </div>
            <ShareInviteDialog inviteCode={group.inviteCode} groupName={group.name} />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/groups/${groupId}/chat`}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Group Chat
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="habits" className="space-y-6">
          <TabsList>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="habits" className="space-y-6">
            <HabitsList groupId={group.id} habits={habitsWithTracking} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id} className="border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profileImage || "/placeholder.svg"} alt={member.name || "User"} />
                      <AvatarFallback>{member.name?.[0] || member.email[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{member.name || "Anonymous"}</p>
                      <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                      {member.role === "admin" && (
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="settings">
              <GroupSettings group={group} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

