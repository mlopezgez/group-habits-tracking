"use client"

import { Card } from "@/components/ui/card"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns"

interface HabitProgressProps {
  habitId: string
  userId: string
  targetDays: number
  checkIns: Array<{
    id: string
    date: string
  }>
}

export function HabitProgress({ habitId, userId, targetDays, checkIns }: HabitProgressProps) {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const checkInDates = checkIns.map((checkIn) => new Date(checkIn.date))

  const thisWeekCheckIns = daysOfWeek.filter((day) => checkInDates.some((checkInDate) => isSameDay(checkInDate, day)))

  const progress = (thisWeekCheckIns.length / targetDays) * 100

  return (
    <Card className="border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">This Week</h2>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {thisWeekCheckIns.length} / {targetDays} days
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => {
          const hasCheckIn = checkInDates.some((checkInDate) => isSameDay(checkInDate, day))
          const isToday = isSameDay(day, today)

          return (
            <div key={day.toISOString()} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{format(day, "EEE")}</span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                  hasCheckIn
                    ? "bg-accent text-accent-foreground"
                    : isToday
                      ? "border-2 border-primary bg-background text-foreground"
                      : "bg-secondary text-secondary-foreground"
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
