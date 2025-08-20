"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Calendar, Clock, Users } from "lucide-react"
import type { Job, WorkUpdate } from "@/types/job"

interface ProgressTrackerProps {
  job: Job
  workUpdates: WorkUpdate[]
}

export function ProgressTracker({ job, workUpdates }: ProgressTrackerProps) {
  const completedUpdates = workUpdates.filter((update) => update.status === "completed").length
  const blockedUpdates = workUpdates.filter((update) => update.status === "blocked").length
  const delayedUpdates = workUpdates.filter((update) => update.status === "delayed").length
  const totalHours = workUpdates.reduce((sum, update) => sum + (update.hoursWorked || 0), 0)

  // Calculate days since start
  const startDate = new Date(job.startDate)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, job.estimatedDuration - daysSinceStart)

  // Calculate progress trend (simplified)
  const expectedProgress = Math.min(100, (daysSinceStart / job.estimatedDuration) * 100)
  const progressDifference = job.progress - expectedProgress

  const getProgressTrend = () => {
    if (progressDifference > 5) return { icon: TrendingUp, color: "text-green-600", label: "Ahead of schedule" }
    if (progressDifference < -5) return { icon: TrendingDown, color: "text-red-600", label: "Behind schedule" }
    return { icon: Minus, color: "text-blue-600", label: "On schedule" }
  }

  const trend = getProgressTrend()
  const TrendIcon = trend.icon

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Project Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Completion</span>
            <span className="text-2xl font-bold text-slate-900">{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-3" />

          <div className="flex items-center gap-2">
            <TrendIcon className={`w-4 h-4 ${trend.color}`} />
            <span className={`text-sm font-medium ${trend.color}`}>{trend.label}</span>
            <span className="text-sm text-slate-500">
              ({progressDifference > 0 ? "+" : ""}
              {progressDifference.toFixed(1)}% vs expected)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Days Remaining</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{daysRemaining}</div>
            <div className="text-xs text-slate-500">of {job.estimatedDuration} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Hours Logged</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalHours}</div>
            <div className="text-xs text-slate-500">{workUpdates.length} updates</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Workers</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{job.assignedWorkers.length}</div>
            <div className="text-xs text-slate-500">assigned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-slate-700">Completed Tasks</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{completedUpdates}</div>
            <div className="text-xs text-slate-500">total updates</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedUpdates}</div>
              <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {workUpdates.filter((u) => u.status === "in-progress").length}
              </div>
              <Badge className="bg-blue-100 text-blue-800 text-xs">In Progress</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{blockedUpdates}</div>
              <Badge className="bg-red-100 text-red-800 text-xs">Blocked</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{delayedUpdates}</div>
              <Badge className="bg-orange-100 text-orange-800 text-xs">Delayed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Alert */}
      {(blockedUpdates > 0 || delayedUpdates > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockedUpdates > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                  <span className="text-sm text-slate-700">
                    {blockedUpdates} update{blockedUpdates !== 1 ? "s" : ""} blocked - immediate action needed
                  </span>
                </div>
              )}
              {delayedUpdates > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">Delayed</Badge>
                  <span className="text-sm text-slate-700">
                    {delayedUpdates} update{delayedUpdates !== 1 ? "s" : ""} delayed - review timeline
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
