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

    // Check if user is a member
    const memberships = await sql`
      SELECT * FROM "GroupMember" 
      WHERE "userId" = ${user.id} AND "groupId" = ${groupId}
    `

    if (memberships.length === 0) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
    }

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const messageId = nanoid()

    await sql`
      INSERT INTO "Message" (id, content, "userId", "groupId", "createdAt")
      VALUES (${messageId}, ${content.trim()}, ${user.id}, ${groupId}, NOW())
    `

    const messages = await sql`SELECT * FROM "Message" WHERE id = ${messageId}`

    return NextResponse.json({ message: messages[0] })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
