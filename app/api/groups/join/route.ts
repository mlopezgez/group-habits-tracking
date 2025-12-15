import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await sql`SELECT * FROM "User" WHERE "clerkId" = ${userId}`
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { inviteCode } = await request.json()

    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    // Find group by invite code
    const groups = await sql`SELECT * FROM "Group" WHERE "inviteCode" = ${inviteCode}`

    if (groups.length === 0) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

    const group = groups[0]

    // Check if already a member
    const existingMembers = await sql`
      SELECT * FROM "GroupMember" 
      WHERE "userId" = ${user.id} AND "groupId" = ${group.id}
    `

    if (existingMembers.length > 0) {
      return NextResponse.json({ error: "Already a member of this group" }, { status: 400 })
    }

    // Add as member
    const memberId = nanoid()
    await sql`
      INSERT INTO "GroupMember" (id, "userId", "groupId", role, "joinedAt")
      VALUES (${memberId}, ${user.id}, ${group.id}, 'member', NOW())
    `

    return NextResponse.json({ group })
  } catch (error) {
    console.error("Error joining group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
