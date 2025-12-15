import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is a member
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: groupId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
    }

    const { date, note, photoUrl } = await request.json()

    const checkInDate = date ? new Date(date) : new Date()
    checkInDate.setHours(0, 0, 0, 0)
    
    const startOfDay = new Date(checkInDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(checkInDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if already checked in for this date
    const existing = await prisma.checkIn.findFirst({
      where: {
        userId: user.id,
        habitId: habitId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Already checked in for this date" }, { status: 400 })
    }

    const checkInId = nanoid()

    const checkIn = await prisma.checkIn.create({
      data: {
        id: checkInId,
        date: checkInDate,
        note: note || null,
        photoUrl: photoUrl || null,
        userId: user.id,
        habitId: habitId,
      },
    })

    return NextResponse.json({ checkIn })
  } catch (error) {
    console.error("Error creating check-in:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; habitId: string }> },
) {
  try {
    const { userId } = await auth()
    const { groupId, habitId } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const checkInId = searchParams.get("checkInId")

    if (!checkInId) {
      return NextResponse.json({ error: "Check-in ID is required" }, { status: 400 })
    }

    // Verify the check-in exists and belongs to the user
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
    })

    if (!checkIn) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 })
    }

    // Verify the check-in belongs to the current user
    if (checkIn.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this check-in" }, { status: 403 })
    }

    // Verify the check-in belongs to the correct habit
    if (checkIn.habitId !== habitId) {
      return NextResponse.json({ error: "Check-in does not belong to this habit" }, { status: 400 })
    }

    // Delete the check-in
    await prisma.checkIn.delete({
      where: { id: checkInId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting check-in:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
