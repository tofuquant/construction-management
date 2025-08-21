"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useJobs } from "@/contexts/job-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SchedulerCalendar } from "@/components/scheduler-calendar"
import { WorkerAvailabilityGrid } from "@/components/worker-availability-grid"
import { JobCreationForm } from "@/components/job-creation-form"
import { LogOut, Calendar, Clock, Users, Plus, CalendarDays, UserCheck } from "lucide-react"

// Mock worker data
const mockWorkers = [
  { id: "1", name: "John Smith", role: "Foundation Specialist" },
  { id: "2", name: "Mike Johnson", role: "Framing Crew Lead" },
  { id: "3", name: "Sarah Davis", role: "Equipment Operator" },
  { id: "4", name: "Tom Wilson", role: "Safety Inspector" },
]

// Mock worker availability data
const mockAvailability = [
  { workerId: "1", workerName: "John Smith", date: "2024-03-19", available: true, assignedJobs: ["1"] },
  { workerId: "1", workerName: "John Smith", date: "2024-03-20", available: true, assignedJobs: [] },
  { workerId: "2", workerName: "Mike Johnson", date: "2024-03-19", available: true, assignedJobs: [] },
  { workerId: "2", workerName: "Mike Johnson", date: "2024-03-20", available: false, assignedJobs: [] },
  { workerId: "3", workerName: "Sarah Davis", date: "2024-03-19", available: true, assignedJobs: ["5"] },
  { workerId: "3", workerName: "Sarah Davis", date: "2024-03-20", available: true, assignedJobs: [] },
  { workerId: "4", workerName: "Tom Wilson", date: "2024-03-19", available: false, assignedJobs: [] },
  { workerId: "4", workerName: "Tom Wilson", date: "2024-03-20", available: true, assignedJobs: [] },
]

export function SchedulerDashboard() {
  const { user, logout } = useAuth()
  const { jobs, updateJob, canCreateJob, canAssignWorkers } = useJobs()
  const [showJobForm, setShowJobForm] = useState(false)
  const [availability, setAvailability] = useState(mockAvailability)

  const todaysJobs = jobs.filter((job) => {
    const today = new Date().toISOString().split("T")[0]
    return job.startDate === today || (job.startDate <= today && job.endDate >= today)
  })

  const availableWorkers = availability.filter(
    (item) => item.date === new Date().toISOString().split("T")[0] && item.available,
  ).length

  const conflicts = jobs.filter((job) => job.assignedWorkers.length === 0 && job.status === "planned").length

  const handleAssignWorker = (jobId: string, workerId: string) => {
    if (canAssignWorkers(user?.role || "")) {
      const job = jobs.find((j) => j.id === jobId)
      if (job && !job.assignedWorkers.includes(workerId)) {
        updateJob(
          jobId,
          {
            assignedWorkers: [...job.assignedWorkers, workerId],
          },
          user?.role || "",
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Project Scheduler</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <Badge variant="secondary" className="text-xs">
                  Scheduler
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Schedule Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{todaysJobs.length}</div>
              <p className="text-xs text-slate-500">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
              <p className="text-xs text-slate-500">All projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Available Workers</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{availableWorkers}</div>
              <p className="text-xs text-slate-500">Ready to assign</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Unassigned Jobs</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{conflicts}</div>
              <p className="text-xs text-slate-500">Need workers</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Worker Availability
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today's Schedule
              </TabsTrigger>
            </TabsList>

            {canCreateJob(user?.role || "") && (
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowJobForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            )}
          </div>

          <TabsContent value="calendar" className="space-y-6">
            <SchedulerCalendar jobs={jobs} workers={mockWorkers} onAssignWorker={handleAssignWorker} />
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <WorkerAvailabilityGrid availability={availability} onUpdateAvailability={setAvailability} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Today's Schedule</CardTitle>
                      <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaysJobs.length > 0 ? (
                      todaysJobs.map((job) => (
                        <div key={job.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="text-sm font-medium text-slate-700">
                            {new Date(job.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{job.title}</p>
                            <p className="text-xs text-slate-500">{job.location}</p>
                          </div>
                          <Badge variant={job.status === "in-progress" ? "default" : "secondary"}>{job.status}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No jobs scheduled for today</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Worker Assignments</CardTitle>
                  <CardDescription>Current job assignments and availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockWorkers.map((worker) => {
                      const workerAvailability = availability.find(
                        (item) => item.workerId === worker.id && item.date === new Date().toISOString().split("T")[0],
                      )
                      const isAvailable = workerAvailability?.available || false
                      const assignedJobsCount = workerAvailability?.assignedJobs.length || 0

                      return (
                        <div key={worker.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{worker.name}</p>
                            <p className="text-xs text-slate-500">{worker.role}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {assignedJobsCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {assignedJobsCount} job(s)
                              </Badge>
                            )}
                            <Badge
                              className={
                                isAvailable
                                  ? assignedJobsCount > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {isAvailable ? (assignedJobsCount > 0 ? "Active" : "Available") : "Off Duty"}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {showJobForm && (
        <JobCreationForm onClose={() => setShowJobForm(false)} onJobCreated={() => setShowJobForm(false)} />
      )}
    </div>
  )
}
