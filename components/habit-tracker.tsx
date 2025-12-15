"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Camera } from "lucide-react"
import { format } from "date-fns"
import { CheckinForm } from "@/components/checkin-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface HabitTrackerProps {
  habitId: string
  groupId: string
  userId: string
  checkIns: Array<{
    id: string
    date: string
    note: string | null
    photoUrl: string | null
  }>
  todayCheckIns: Array<{
    id: string
    name: string | null
    profileImage: string | null
    createdAt: string
    note: string | null
    photoUrl: string | null
  }>
}

export function HabitTracker({ habitId, groupId, userId, checkIns, todayCheckIns }: HabitTrackerProps) {
  const [loading, setLoading] = useState(false)
  const [localCheckIns, setLocalCheckIns] = useState(checkIns)
  const [dialogOpen, setDialogOpen] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  const hasCheckedInToday = localCheckIns.some((checkIn) => {
    const checkInDate = new Date(checkIn.date)
    checkInDate.setHours(0, 0, 0, 0)
    return checkInDate.getTime() === today.getTime()
  })

  async function handleCheckIn() {
    setLoading(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/habits/${habitId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr }),
      })

      if (!response.ok) throw new Error("Failed to check in")

      const { checkIn } = await response.json()
      setLocalCheckIns([checkIn, ...localCheckIns])
    } catch (error) {
      console.error("Error checking in:", error)
      alert("Failed to check in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Today's Progress</h2>

        {!hasCheckedInToday ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">Mark this habit as complete for today</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                  <Camera className="mr-2 h-5 w-5" />
                  Check In
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Complete Your Check-in</DialogTitle>
                </DialogHeader>
                <CheckinForm
                  groupId={groupId}
                  habitId={habitId}
                  onSuccess={() => {
                    setDialogOpen(false)
                    window.location.reload()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="rounded-lg bg-accent/50 p-4 text-center">
            <Check className="mx-auto mb-2 h-8 w-8 text-accent-foreground" />
            <p className="font-medium text-accent-foreground">Checked in today!</p>
          </div>
        )}
      </Card>

      {todayCheckIns.length > 0 && (
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Who Checked In Today</h2>
          <div className="space-y-3">
            {todayCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={checkIn.profileImage || "/placeholder.svg"} alt={checkIn.name || "User"} />
                  <AvatarFallback>{checkIn.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{checkIn.name || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(checkIn.createdAt), "h:mm a")}</p>
                </div>
                <Check className="h-5 w-5 text-accent" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
