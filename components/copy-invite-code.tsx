"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CopyInviteCodeProps {
  inviteCode: string
  groupName?: string
}

export function CopyInviteCode({ inviteCode, groupName }: CopyInviteCodeProps) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // Check if Web Share API is available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanShare(true)
    }
  }, [])

  function getInviteLink() {
    // Use window.location to get the current domain (works on both client and server)
    if (typeof window !== 'undefined') {
      const origin = window.location.origin
      return `${origin}/groups/join/${inviteCode}`
    }
    // Fallback for SSR
    return `https://habits.matias-lopez.com/groups/join/${inviteCode}`
  }

  async function handleShare() {
    const inviteLink = getInviteLink()
    
    // Try Web Share API first (mobile devices)
    if (canShare && navigator.share) {
      try {
        await navigator.share({
          title: groupName ? `Join "${groupName}" on Habits Together` : 'Join my group on Habits Together',
          text: 'Track habits together with me!',
          url: inviteLink,
        })
        toast({
          title: "Shared successfully",
          description: "Invite link shared",
        })
        return
      } catch (error) {
        // User cancelled or error occurred, fall through to copy
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    }
    
    // Fallback to clipboard
    await copyToClipboard()
  }

  async function copyToClipboard() {
    try {
      const inviteLink = getInviteLink()
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Invite link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-2">
      {canShare ? (
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Invite
        </Button>
      ) : (
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
      )}
    </div>
  )
}
