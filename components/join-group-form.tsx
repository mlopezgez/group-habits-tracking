"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface JoinGroupFormProps {
  initialCode?: string
}

export function JoinGroupForm({ initialCode }: JoinGroupFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [inviteInput, setInviteInput] = useState(initialCode || "")

  // Extract invite code from URL if a full link is pasted
  function extractInviteCode(input: string): string {
    if (!input) return ""

    // If it's a full URL, try to extract the code from the path
    try {
      const url = new URL(input)
      const pathParts = url.pathname.split("/")
      const codeIndex = pathParts.indexOf("join")
      if (codeIndex !== -1 && pathParts[codeIndex + 1]) {
        return pathParts[codeIndex + 1]
      }
    } catch {
      // Not a valid URL, treat as code
    }

    // If it contains "/groups/join/", extract the code after it
    const match = input.match(/\/groups\/join\/([^/?]+)/)
    if (match && match[1]) {
      return match[1]
    }

    // Otherwise, treat the whole input as the code
    return input.trim()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const inviteCode = extractInviteCode(inviteInput)

      if (!inviteCode) {
        throw new Error("Please enter an invite link or code")
      }

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
          <Label htmlFor="inviteInput">Invite Link or Code</Label>
          <Input
            id="inviteInput"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="Paste invite link or enter code"
            required
            className="bg-background"
          />
          <p className="text-sm text-muted-foreground">
            Paste the invite link or enter the invite code to join a group
          </p>
        </div>

        <Button type="submit" disabled={loading || !inviteInput.trim()} className="w-full">
          {loading ? "Joining..." : "Join Group"}
        </Button>
      </form>
    </Card>
  )
}
