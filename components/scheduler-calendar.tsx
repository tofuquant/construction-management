"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, User } from "lucide-react"
import type { Job, Worker } from "@/types/job"

interface SchedulerCalendarProps {
  jobs: Job[]
  workers: Worker[]
  onAssignWorker: (jobId: string, workerId: string) => void
}

export function SchedulerCalendar({ jobs, workers, onAssignWorker }: SchedulerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getJobsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return jobs.filter(
      (job) =>
        job.startDate === dateStr || job.endDate === dateStr || (job.startDate <= dateStr && job.endDate >= dateStr),
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dayJobs = getJobsForDate(day)

          return (
            <Card key={day} className="min-h-[100px] p-2">
              <div className="text-sm font-medium mb-1">{day}</div>
              <div className="space-y-1">
                {dayJobs.map((job) => (
                  <div key={job.id} className="text-xs">
                    <Badge
                      variant={job.status === "in-progress" ? "default" : "secondary"}
                      className="w-full justify-start text-xs p-1"
                    >
                      {job.title.substring(0, 15)}...
                    </Badge>
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">{job.assignedWorkers.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
