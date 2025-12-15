import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupChatPage({ params }: PageProps) {
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

  // Check if user is a member
  const memberships = await sql`
    SELECT * FROM "GroupMember" 
    WHERE "userId" = ${user.id} AND "groupId" = ${groupId}
  `

  if (memberships.length === 0) {
    redirect("/dashboard")
  }

  // Get group details
  const groups = await sql`SELECT * FROM "Group" WHERE id = ${groupId}`

  if (groups.length === 0) {
    redirect("/dashboard")
  }

  const group = groups[0]

  // Get recent messages (last 100)
  const messages = await sql`
    SELECT m.*, u.name, u."profileImage", u.email
    FROM "Message" m
    JOIN "User" u ON m."userId" = u.id
    WHERE m."groupId" = ${groupId}
    ORDER BY m."createdAt" DESC
    LIMIT 100
  `

  const reversedMessages = messages.reverse()

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${groupId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{group.name}</h1>
            <p className="text-sm text-muted-foreground">Group Chat</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-4xl">
          <ChatMessages messages={reversedMessages} currentUserId={user.id} />
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <ChatInput groupId={groupId} />
        </div>
      </div>
    </div>
  )
}
