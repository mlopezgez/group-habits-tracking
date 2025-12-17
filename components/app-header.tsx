"use client"

import { SignOutButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { LogOut, Target } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  
  // Don't show header on sign-in/sign-up pages, home page, or chat pages (they have their own headers)
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')
  const isHomePage = pathname === '/'
  const isChatPage = pathname?.includes('/chat')
  
  if (isAuthPage || isHomePage || isChatPage || !isLoaded || !user) {
    return null
  }

  // Always render the header structure consistently to avoid hydration issues
  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Habits Together</span>
        </Link>
        <div className="flex items-center gap-3">
          {user.firstName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user.firstName}</span>
            </div>
          )}
          <SignOutButton redirectUrl="/">
            <Button variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </header>
  )
}
