"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const EMOJI_OPTIONS = ["🎯", "💪", "🏃", "📚", "🧘", "💧", "🥗", "😴", "🎨", "✍️", "🎵", "🧠"]
const COLOR_OPTIONS = [
  { name: "Purple", value: "oklch(0.55 0.22 262)" },
  { name: "Green", value: "oklch(0.65 0.25 142)" },
  { name: "Blue", value: "oklch(0.6 0.2 240)" },
  { name: "Orange", value: "oklch(0.7 0.22 50)" },
  { name: "Pink", value: "oklch(0.65 0.24 350)" },
  { name: "Teal", value: "oklch(0.68 0.23 200)" },
]

interface CreateHabitFormProps {
  groupId: string
}

export function CreateHabitForm({ groupId }: CreateHabitFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [targetDays, setTargetDays] = useState(7)
  const [icon, setIcon] = useState("🎯")
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, frequency, targetDays, icon, color }),
      })

      if (!response.ok) throw new Error("Failed to create habit")

      const { habit } = await response.json()
      router.push(`/groups/${groupId}/habits/${habit.id}`)
    } catch (error) {
      console.error("Error creating habit:", error)
      alert("Failed to create habit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Habit Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Morning Workout"
            required
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="30 minutes of exercise each morning"
            rows={3}
            className="bg-background"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDays">Target (days per week)</Label>
            <Input
              id="targetDays"
              type="number"
              min={1}
              max={7}
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="grid grid-cols-6 gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`rounded-lg border-2 p-3 text-2xl transition-all hover:scale-110 ${
                  icon === emoji ? "border-primary bg-primary/10" : "border-border bg-background"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="grid grid-cols-6 gap-2">
            {COLOR_OPTIONS.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setColor(colorOption.value)}
                className={`h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                  color === colorOption.value ? "border-primary" : "border-border"
                }`}
                style={{ backgroundColor: colorOption.value }}
              >
                <span className="sr-only">{colorOption.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading || !name.trim()} className="w-full">
          {loading ? "Creating..." : "Create Habit"}
        </Button>
      </form>
    </Card>
  )
}
