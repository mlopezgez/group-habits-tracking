import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { DeleteCheckinButton } from "@/components/delete-checkin-button"

export default async function CheckinsPage({
  params,
}: {
  params: Promise<{ groupId: string; habitId: string }>
}) {
  const { groupId, habitId } = await params
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  // Get the current user from database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  if (!dbUser) {
    redirect("/sign-in")
  }

  // Get habit details with group information
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
    },
  })

  if (!habit) {
    redirect("/dashboard")
  }

  // Get all check-ins for this habit with user information
  const checkins = await prisma.checkIn.findMany({
    where: {
      habitId: habitId,
    },
    select: {
      id: true,
      date: true,
      note: true,
      photoUrl: true,
      userId: true,
      user: {
        select: {
          clerkId: true,
          email: true,
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 50,
  }) as Array<{
    id: string
    date: Date
    note: string | null
    photoUrl: string | null
    userId: string
    user: {
      clerkId: string
      email: string
      name: string | null
      profileImage: string | null
    }
  }>

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            href={`/groups/${groupId}/habits/${habitId}`}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to habit
          </Link>
          <h1 className="text-3xl font-bold text-balance mb-2">{habit.name}</h1>
          <p className="text-muted-foreground">{habit.group.name}</p>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Check-in History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View all check-ins from your group members</p>
          </CardContent>
        </Card>

        {checkins.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No check-ins yet. Be the first to check in!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {checkins.map((checkin) => (
              <Card key={checkin.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={checkin.user.profileImage || "/placeholder.svg"} alt={checkin.user.name || ""} />
                      <AvatarFallback>
                        {checkin.user.name?.charAt(0) || checkin.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{checkin.user.name || checkin.user.email}</p>
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(checkin.date), { addSuffix: true })}
                          </Badge>
                        </div>
                        {checkin.userId === dbUser.id && (
                          <DeleteCheckinButton
                            checkInId={checkin.id}
                            groupId={groupId}
                            habitId={habitId}
                          />
                        )}
                      </div>
                      {checkin.note && <p className="text-sm text-muted-foreground mb-2 text-pretty">{checkin.note}</p>}
                      {checkin.photoUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mt-2">
                          <Image
                            src={checkin.photoUrl || "/placeholder.svg"}
                            alt="Check-in photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
