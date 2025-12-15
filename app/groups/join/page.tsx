import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { JoinGroupForm } from "@/components/join-group-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function JoinGroupPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight">Join a Group</h1>
          <p className="mt-2 text-muted-foreground">Enter the invite code to join an existing group</p>
        </div>

        <JoinGroupForm />
      </div>
    </div>
  )
}
