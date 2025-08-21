"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, XCircle, Calendar, User } from "lucide-react"
import type { WorkUpdate } from "@/types/job"

interface StatusTimelineProps {
  workUpdates: WorkUpdate[]
  jobTitle?: string
}

export function StatusTimeline({ workUpdates, jobTitle }: StatusTimelineProps) {
  const sortedUpdates = [...workUpdates].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const getStatusIcon = (status: WorkUpdate["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "blocked":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "delayed":
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: WorkUpdate["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      case "delayed":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  if (sortedUpdates.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Status Updates</h3>
          <p className="text-slate-600">Status updates will appear here as work progresses.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Status Timeline {jobTitle && `- ${jobTitle}`}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{sortedUpdates.length} updates</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedUpdates.map((update, index) => (
            <div key={update.id} className="relative">
              {/* Timeline line */}
              {index < sortedUpdates.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-16 bg-slate-200" />}

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center">
                  {getStatusIcon(update.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(update.status)}>{update.status.replace("-", " ")}</Badge>
                      {update.hoursWorked && <Badge variant="outline">{update.hoursWorked} hours</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(update.timestamp).toLocaleDateString()}</span>
                      <span>
                        {new Date(update.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{update.workerName}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{update.description}</p>

                    {update.photos.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="flex -space-x-2">
                          {update.photos.slice(0, 3).map((photo, photoIndex) => (
                            <div
                              key={photoIndex}
                              className="w-8 h-8 bg-slate-200 border-2 border-white rounded-full overflow-hidden"
                            >
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`Photo ${photoIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {update.photos.length} photo{update.photos.length !== 1 ? "s" : ""} attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
