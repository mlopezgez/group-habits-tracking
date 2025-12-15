"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function JoinGroupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to join group")
      }

      const { group } = await response.json()
      router.push(`/groups/${group.id}`)
    } catch (error) {
      console.error("Error joining group:", error)
      alert(error instanceof Error ? error.message : "Failed to join group. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Invite Code</Label>
          <Input
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
            required
            className="bg-background font-mono"
          />
          <p className="text-sm text-muted-foreground">Ask your friend for the group invite code</p>
        </div>

        <Button type="submit" disabled={loading || !inviteCode.trim()} className="w-full">
          {loading ? "Joining..." : "Join Group"}
        </Button>
      </form>
    </Card>
  )
}
