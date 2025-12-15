import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { userId } = await auth()
    const { groupId } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await sql`SELECT * FROM "User" WHERE "clerkId" = ${userId}`
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is admin
    const memberships = await sql`
      SELECT * FROM "GroupMember" 
      WHERE "userId" = ${user.id} AND "groupId" = ${groupId} AND role = 'admin'
    `

    if (memberships.length === 0) {
      return NextResponse.json({ error: "Only admins can create habits" }, { status: 403 })
    }

    const { name, description, frequency, targetDays, icon, color } = await request.json()

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const habitId = nanoid()

    await sql`
      INSERT INTO "Habit" (
        id, name, description, frequency, "targetDays", icon, color, 
        "isActive", "groupId", "createdAt", "updatedAt"
      )
      VALUES (
        ${habitId}, ${name}, ${description || null}, ${frequency}, ${targetDays},
        ${icon}, ${color}, true, ${groupId}, NOW(), NOW()
      )
    `

    const habits = await sql`SELECT * FROM "Habit" WHERE id = ${habitId}`

    return NextResponse.json({ habit: habits[0] })
  } catch (error) {
    console.error("Error creating habit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

