"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Share2, Link as LinkIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ShareInviteDialogProps {
  inviteCode: string
  groupName: string
}

export function ShareInviteDialog({ inviteCode, groupName }: ShareInviteDialogProps) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  useEffect(() => {
    // Check if Web Share API is available
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanShare(true)
    }

    // Generate invite link using current domain
    if (typeof window !== 'undefined') {
      const origin = window.location.origin
      setInviteLink(`${origin}/groups/join/${inviteCode}`)
    }
  }, [inviteCode])

  async function handleWebShare() {
    if (canShare && navigator.share) {
      try {
        await navigator.share({
          title: `Join "${groupName}" on Habits Together`,
          text: 'Track habits together with me!',
          url: inviteLink,
        })
        toast({
          title: "Shared successfully",
          description: "Invite link shared",
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
          toast({
            title: "Error",
            description: "Failed to share link",
            variant: "destructive",
          })
        }
      }
    }
  }

  async function handleCopy() {
    try {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite People to {groupName}</DialogTitle>
          <DialogDescription>
            Share this link with friends to invite them to your group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-link">Invite Link</Label>
            <div className="flex gap-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <div className="flex gap-2">
              <Input
                id="invite-code"
                value={inviteCode}
                readOnly
                className="flex-1 font-mono"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(inviteCode)
                    toast({
                      title: "Code copied!",
                      description: "Invite code copied to clipboard",
                    })
                  } catch (error) {
                    console.error('Error copying code:', error)
                  }
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {canShare && (
            <Button
              type="button"
              className="w-full"
              onClick={handleWebShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share via Apps
            </Button>
          )}

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Anyone with this link or code can join your group. 
              You can regenerate the invite code in group settings if needed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
