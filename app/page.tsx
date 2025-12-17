import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Users, Target, TrendingUp, Sparkles } from "lucide-react"

export default async function HomePage() {
  const { userId } = await auth()

  if (userId) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Habits Together</span>
          </div>
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Track habits together with friends
          </div>
          <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
            Build Better Habits,
            <span className="text-primary"> Together</span>
          </h1>
          <p className="mt-6 text-balance text-lg leading-relaxed text-muted-foreground">
            Stay accountable with friends, share progress with photos, and celebrate milestones together. Join groups,
            track daily check-ins, and make habit-building a social experience.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8">
                Start Tracking Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Group Accountability</h3>
            <p className="text-muted-foreground">
              Create or join groups with friends. Share your journey and stay motivated together.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Check className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Daily Check-ins</h3>
            <p className="text-muted-foreground">
              Track your progress with daily check-ins, add photos, and see who else checked in today.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Track Progress</h3>
            <p className="text-muted-foreground">
              Visualize your streaks, completion rates, and habit history with beautiful charts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-12 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Ready to build better habits?</h2>
          <p className="mt-4 text-lg text-muted-foreground">Join thousands of people tracking habits together</p>
          <div className="mt-8">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Habits Together. Built with v0 by Vercel.</p>
        </div>
      </footer>
    </div>
  )
}
