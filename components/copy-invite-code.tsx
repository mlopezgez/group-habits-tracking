"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CopyInviteCodeProps {
  inviteCode: string
}

export function CopyInviteCode({ inviteCode }: CopyInviteCodeProps) {
  const [copied, setCopied] = useState(false)

  function getInviteLink() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://habits.matias-lopez.com"
    return `${baseUrl}/groups/join/${inviteCode}`
  }

  async function copyToClipboard() {
    const inviteLink = getInviteLink()
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={copyToClipboard}>
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copy Invite Link
        </>
      )}
    </Button>
  )
}
