import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

export default async function CheckinsPage({
  params,
}: {
  params: Promise<{ groupId: string; habitId: string }>
}) {
  const { groupId, habitId } = await params
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Get habit details
  const [habit] = await sql`
    SELECT h.*, g.name as group_name
    FROM habits h
    JOIN groups g ON h.group_id = g.id
    WHERE h.id = ${habitId} AND h.group_id = ${groupId}
  `

  if (!habit) {
    redirect("/dashboard")
  }

  // Get all check-ins for this habit
  const checkins = await sql`
    SELECT 
      c.*,
      u.clerk_id,
      u.email,
      u.name,
      u.image_url
    FROM checkins c
    JOIN users u ON c.user_id = u.id
    WHERE c.habit_id = ${habitId}
    ORDER BY c.checked_at DESC
    LIMIT 50
  `

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
          <p className="text-muted-foreground">{habit.group_name}</p>
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
                      <AvatarImage src={checkin.image_url || "/placeholder.svg"} alt={checkin.name} />
                      <AvatarFallback>
                        {checkin.name?.charAt(0) || checkin.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{checkin.name || checkin.email}</p>
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(checkin.checked_at), { addSuffix: true })}
                        </Badge>
                      </div>
                      {checkin.note && <p className="text-sm text-muted-foreground mb-2 text-pretty">{checkin.note}</p>}
                      {checkin.photo_url && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mt-2">
                          <Image
                            src={checkin.photo_url || "/placeholder.svg"}
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
