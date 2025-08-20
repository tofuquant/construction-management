"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, CheckCircle, XCircle } from "lucide-react"

interface WorkerAvailability {
  workerId: string
  workerName: string
  date: string
  available: boolean
  assignedJobs: string[]
}

interface WorkerAvailabilityGridProps {
  availability: WorkerAvailability[]
  onUpdateAvailability: (availability: WorkerAvailability[]) => void
}

export function WorkerAvailabilityGrid({ availability, onUpdateAvailability }: WorkerAvailabilityGridProps) {
  const toggleAvailability = (workerId: string, date: string) => {
    const updated = availability.map((item) =>
      item.workerId === workerId && item.date === date ? { ...item, available: !item.available } : item,
    )
    onUpdateAvailability(updated)
  }

  const dates = [...new Set(availability.map((item) => item.date))].sort()
  const workers = [...new Set(availability.map((item) => ({ id: item.workerId, name: item.workerName })))]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Available
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-500" />
          Unavailable
        </Badge>
      </div>

      <div className="grid gap-4">
        {workers.map((worker) => (
          <Card key={worker.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                {worker.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {dates.map((date) => {
                  const workerAvailability = availability.find(
                    (item) => item.workerId === worker.id && item.date === date,
                  )

                  return (
                    <div key={`${worker.id}-${date}`} className="space-y-2">
                      <div className="text-sm font-medium">{new Date(date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workerAvailability?.available || false}
                          onCheckedChange={() => toggleAvailability(worker.id, date)}
                        />
                        <span className="text-xs">{workerAvailability?.available ? "Available" : "Unavailable"}</span>
                      </div>
                      {workerAvailability?.assignedJobs.length ? (
                        <Badge variant="secondary" className="text-xs">
                          {workerAvailability.assignedJobs.length} job(s)
                        </Badge>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
