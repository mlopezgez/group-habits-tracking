import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default async function JoinGroupWithCodePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>
}) {
  const { userId } = await auth()
  const { inviteCode } = await params

  if (!userId) {
    redirect(`/sign-in?redirect=/groups/join/${inviteCode}`)
  }

  // Redirect to join page with the invite code as a query parameter
  redirect(`/groups/join?code=${inviteCode}`)
}
