"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useJobs } from "@/contexts/job-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusTimeline } from "@/components/status-timeline"
import { ProgressTracker } from "@/components/progress-tracker"
import { JobCreationForm } from "@/components/job-creation-form"
import { JobList } from "@/components/job-list"
import { LogOut, MapPin, Users, AlertTriangle, Activity, TrendingUp, Plus, Briefcase } from "lucide-react"

export function CoordinatorDashboard() {
  const { user, logout } = useAuth()
  const { jobs, workUpdates, getWorkUpdatesByJob, canCreateJob } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || "")
  const [showJobCreation, setShowJobCreation] = useState(false)

  const selectedJob = jobs.find((job) => job.id === selectedJobId)
  const selectedJobUpdates = selectedJob ? getWorkUpdatesByJob(selectedJob.id) : []

  const activeJobs = jobs.filter((job) => job.status === "in-progress")
  const totalWorkers = jobs.reduce((sum, job) => sum + job.assignedWorkers.length, 0)
  const pendingUpdates = workUpdates.filter(
    (update) => update.status === "blocked" || update.status === "delayed",
  ).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Site Coordinator</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <Badge variant="secondary" className="text-xs">
                  Coordinator
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
        {/* Site Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Sites</CardTitle>
              <MapPin className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{activeJobs.length}</div>
              <p className="text-xs text-slate-500">Under supervision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Workers On-Site</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalWorkers}</div>
              <p className="text-xs text-slate-500">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{pendingUpdates}</div>
              <p className="text-xs text-slate-500">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="status" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Status Tracking
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Progress Analysis
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Management
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {canCreateJob(user?.role || "") && (
                <Button onClick={() => setShowJobCreation(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              )}

              {jobs.length > 0 && (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <TabsContent value="status" className="space-y-6">
            {selectedJob ? (
              <StatusTimeline workUpdates={selectedJobUpdates} jobTitle={selectedJob.title} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Jobs Available</h3>
                  <p className="text-slate-600">No jobs to track at the moment.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {selectedJob ? (
              <ProgressTracker job={selectedJob} workUpdates={selectedJobUpdates} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Jobs Available</h3>
                  <p className="text-slate-600">No jobs to analyze at the moment.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobList />
          </TabsContent>
        </Tabs>
      </main>

      {showJobCreation && (
        <JobCreationForm
          onClose={() => setShowJobCreation(false)}
          onJobCreated={() => {
            setShowJobCreation(false)
          }}
        />
      )}
    </div>
  )
}
