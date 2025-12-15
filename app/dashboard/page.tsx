import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { ensureUserInDatabase } from "@/lib/clerk"
import { GroupCard } from "@/components/group-card"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  try {
    const { userId } = await auth()

    // Middleware already protects this route, so userId will always exist
    if (!userId) {
      return null
    }

    // Ensure user exists in database (creates if missing)
    const user = await ensureUserInDatabase(userId)

    if (!user) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="mt-2 text-muted-foreground">Unable to load user data</p>
          </div>
        </div>
      )
    }

    // Get groups where user is a member
    const groups = await sql`
      SELECT 
        g.*,
        u.name as owner_name,
        u."profileImage" as owner_image,
        COUNT(DISTINCT gm.id) as member_count,
        COUNT(DISTINCT h.id) as habit_count
      FROM "Group" g
      INNER JOIN "GroupMember" gm ON g.id = gm."groupId"
      LEFT JOIN "User" u ON g."ownerId" = u.id
      LEFT JOIN "GroupMember" gm2 ON g.id = gm2."groupId"
      LEFT JOIN "Habit" h ON g.id = h."groupId" AND h."isActive" = true
      WHERE gm."userId" = ${user.id}
      GROUP BY g.id, u.name, u."profileImage"
      ORDER BY g."createdAt" DESC
    `

    return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight">Your Groups</h1>
            <p className="mt-2 text-muted-foreground">Track habits together with your friends</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/groups/join">
                <Users className="mr-2 h-4 w-4" />
                Join Group
              </Link>
            </Button>
            <Button asChild>
              <Link href="/groups/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Link>
            </Button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No groups yet</h2>
            <p className="mb-6 text-muted-foreground">Create your first group or join an existing one to get started</p>
            <div className="flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/groups/join">Join Group</Link>
              </Button>
              <Button asChild>
                <Link href="/groups/new">Create Group</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    )
  }
}
