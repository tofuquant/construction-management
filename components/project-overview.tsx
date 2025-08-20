"use client"

import { useJobs } from "@/contexts/job-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

export function ProjectOverview() {
  const { jobs, workUpdates } = useJobs()

  // Calculate overall statistics
  const totalJobs = jobs.length
  const activeJobs = jobs.filter((job) => job.status === "in-progress").length
  const completedJobs = jobs.filter((job) => job.status === "completed").length
  const onHoldJobs = jobs.filter((job) => job.status === "on-hold").length
  const plannedJobs = jobs.filter((job) => job.status === "planned").length

  const totalBudget = jobs.reduce((sum, job) => sum + (job.budget || 0), 0)
  const averageProgress = jobs.reduce((sum, job) => sum + job.progress, 0) / jobs.length || 0

  // Status distribution data for pie chart
  const statusData = [
    { name: "Active", value: activeJobs, color: "#10b981" },
    { name: "Completed", value: completedJobs, color: "#6b7280" },
    { name: "Planned", value: plannedJobs, color: "#3b82f6" },
    { name: "On Hold", value: onHoldJobs, color: "#f59e0b" },
  ].filter((item) => item.value > 0)

  // Progress distribution data for bar chart
  const progressRanges = [
    { range: "0-25%", count: jobs.filter((job) => job.progress >= 0 && job.progress < 25).length },
    { range: "25-50%", count: jobs.filter((job) => job.progress >= 25 && job.progress < 50).length },
    { range: "50-75%", count: jobs.filter((job) => job.progress >= 50 && job.progress < 75).length },
    { range: "75-100%", count: jobs.filter((job) => job.progress >= 75 && job.progress <= 100).length },
  ]

  // Recent activity
  const recentUpdates = workUpdates
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  // Issues that need attention
  const blockedUpdates = workUpdates.filter((update) => update.status === "blocked")
  const delayedUpdates = workUpdates.filter((update) => update.status === "delayed")
  const urgentJobs = jobs.filter((job) => job.priority === "urgent" && job.status !== "completed")

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalJobs}</div>
            <p className="text-xs text-slate-500">{activeJobs} currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{averageProgress.toFixed(1)}%</div>
            <Progress value={averageProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {blockedUpdates.length + delayedUpdates.length + urgentJobs.length}
            </div>
            <p className="text-xs text-slate-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Progress Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ea580c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues */}
        {(blockedUpdates.length > 0 || delayedUpdates.length > 0 || urgentJobs.length > 0) && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Issues Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentJobs.length > 0 && (
                <div>
                  <Badge className="bg-red-100 text-red-800 mb-2">Urgent Projects</Badge>
                  {urgentJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="text-sm text-slate-700 ml-2">
                      • {job.title}
                    </div>
                  ))}
                </div>
              )}
              {blockedUpdates.length > 0 && (
                <div>
                  <Badge className="bg-red-100 text-red-800 mb-2">Blocked Work</Badge>
                  <div className="text-sm text-slate-700 ml-2">
                    {blockedUpdates.length} work update{blockedUpdates.length !== 1 ? "s" : ""} blocked
                  </div>
                </div>
              )}
              {delayedUpdates.length > 0 && (
                <div>
                  <Badge className="bg-orange-100 text-orange-800 mb-2">Delayed Work</Badge>
                  <div className="text-sm text-slate-700 ml-2">
                    {delayedUpdates.length} work update{delayedUpdates.length !== 1 ? "s" : ""} delayed
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUpdates.map((update) => {
                const job = jobs.find((j) => j.id === update.jobId)
                return (
                  <div key={update.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {update.workerName} - {update.status.replace("-", " ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {job?.title} - {new Date(update.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
              {recentUpdates.length === 0 && <p className="text-sm text-slate-500">No recent activity</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
