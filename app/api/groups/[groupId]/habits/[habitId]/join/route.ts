import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

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

    // Verify user is a member of the group
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

    // Verify the habit exists and belongs to the group
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    })

    if (!habit || habit.groupId !== groupId) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    // Check if user is already tracking this habit
    const existing = await prisma.userHabit.findUnique({
      where: {
        userId_habitId: {
          userId: user.id,
          habitId: habitId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Already tracking this habit" }, { status: 400 })
    }

    // Add user to habit
    await prisma.userHabit.create({
      data: {
        id: nanoid(),
        userId: user.id,
        habitId: habitId,
      },
    })

    revalidatePath(`/groups/${groupId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining habit:", error)
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

    // Verify user is a member of the group
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

    // Verify the habit exists and belongs to the group
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    })

    if (!habit || habit.groupId !== groupId) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    // Remove user from habit
    await prisma.userHabit.delete({
      where: {
        userId_habitId: {
          userId: user.id,
          habitId: habitId,
        },
      },
    })

    revalidatePath(`/groups/${groupId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving habit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
