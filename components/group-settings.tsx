"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface GroupSettingsProps {
  group: {
    id: string
    name: string
    description: string | null
  }
}

export function GroupSettings({ group }: GroupSettingsProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Group Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Group Name</label>
            <p className="mt-1">{group.name}</p>
          </div>
          {group.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1">{group.description}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="border-destructive/50 bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-destructive/10 p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-destructive">Danger Zone</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Deleting this group will permanently remove all habits, check-ins, and chat messages. This action cannot
              be undone.
            </p>
            <Button variant="destructive">Delete Group</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
