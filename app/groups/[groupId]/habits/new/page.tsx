import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { CreateHabitForm } from "@/components/create-habit-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default async function NewHabitPage({ params }: PageProps) {
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

  // Check if user is admin
  const memberships = await sql`
    SELECT * FROM "GroupMember" 
    WHERE "userId" = ${user.id} AND "groupId" = ${groupId} AND role = 'admin'
  `

  if (memberships.length === 0) {
    redirect(`/groups/${groupId}`)
  }

  const groups = await sql`SELECT * FROM "Group" WHERE id = ${groupId}`
  const group = groups[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {group.name}
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight">Create a New Habit</h1>
          <p className="mt-2 text-muted-foreground">Set up a habit for your group to track together</p>
        </div>

        <CreateHabitForm groupId={groupId} />
      </div>
    </div>
  )
}

