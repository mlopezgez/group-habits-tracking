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

    const { name, description } = await request.json()

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const groupId = nanoid()
    const inviteCode = nanoid(10)

    // Create group
    await sql`
      INSERT INTO "Group" (id, name, description, "inviteCode", "ownerId", "createdAt", "updatedAt")
      VALUES (${groupId}, ${name}, ${description || null}, ${inviteCode}, ${user.id}, NOW(), NOW())
    `

    // Add creator as admin member
    const memberId = nanoid()
    await sql`
      INSERT INTO "GroupMember" (id, "userId", "groupId", role, "joinedAt")
      VALUES (${memberId}, ${user.id}, ${groupId}, 'admin', NOW())
    `

    const groups = await sql`SELECT * FROM "Group" WHERE id = ${groupId}`

    return NextResponse.json({ group: groups[0] })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
