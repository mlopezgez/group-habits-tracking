"use client"

import { SignOutButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { LogOut, Target } from "lucide-react"
import { usePathname } from "next/navigation"

export function AppHeader() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  
  // Hide header on auth pages, home page, and chat pages
  const shouldHide = 
    pathname?.startsWith('/sign-in') || 
    pathname?.startsWith('/sign-up') || 
    pathname === '/' || 
    pathname?.includes('/chat') ||
    !isLoaded || 
    !user
  
  if (shouldHide) {
    return null
  }

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo - explicitly not clickable */}
        <div className="flex items-center gap-2 pointer-events-none select-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Habits Together</span>
        </div>
        
        {/* User actions */}
        <div className="flex items-center gap-3">
          {user.firstName && (
            <span className="text-sm text-muted-foreground">{user.firstName}</span>
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
