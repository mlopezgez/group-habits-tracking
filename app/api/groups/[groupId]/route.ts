import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const { userId } = await auth()
    const { groupId } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the group and verify ownership
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Verify the user is the owner
    if (group.ownerId !== user.id) {
      return NextResponse.json({ error: "Only the group owner can delete the group" }, { status: 403 })
    }

    // Delete the group (cascade will delete related records: habits, check-ins, members, messages)
    await prisma.group.delete({
      where: { id: groupId },
    })

    // Revalidate the dashboard and group pages to clear cache
    revalidatePath("/dashboard")
    revalidatePath(`/groups/${groupId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
