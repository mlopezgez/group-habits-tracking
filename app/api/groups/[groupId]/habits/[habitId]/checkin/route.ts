import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { nanoid } from "nanoid"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; habitId: string }> },
) {
  try {
    const { userId } = await auth()
    const { groupId, habitId } = await params

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

    const { date, note, photoUrl } = await request.json()

    const checkInDate = date ? new Date(date) : new Date()
    checkInDate.setHours(0, 0, 0, 0)

    // Check if already checked in today
    const existing = await sql`
      SELECT * FROM "CheckIn"
      WHERE "userId" = ${user.id} 
        AND "habitId" = ${habitId}
        AND DATE(date) = DATE(${checkInDate.toISOString()})
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Already checked in for this date" }, { status: 400 })
    }

    const checkInId = nanoid()

    await sql`
      INSERT INTO "CheckIn" (id, date, note, "photoUrl", "userId", "habitId", "createdAt")
      VALUES (
        ${checkInId}, 
        ${checkInDate.toISOString()}, 
        ${note || null}, 
        ${photoUrl || null}, 
        ${user.id}, 
        ${habitId}, 
        NOW()
      )
    `

    const checkIns = await sql`SELECT * FROM "CheckIn" WHERE id = ${checkInId}`

    return NextResponse.json({ checkIn: checkIns[0] })
  } catch (error) {
    console.error("Error creating check-in:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
