"use client"
import { useAuth } from "@/contexts/auth-context"
import { useJobs } from "@/contexts/job-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobList } from "@/components/job-list"
import { ProjectOverview } from "@/components/project-overview"
import { WhatsAppIntegration } from "@/components/whatsapp-integration"
import { WhatsAppJobManager } from "@/components/whatsapp-job-manager"
import { WhatsAppPhotoManager } from "@/components/whatsapp-photo-manager"
import { DrivePhotoOrganizer } from "@/components/drive-photo-organizer"
import { LogOut, Users, Briefcase, BarChart3, Activity, MessageSquare, FolderOpen, XCircle } from "lucide-react"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const { jobs, canCloseJob } = useJobs()

  const activeJobs = jobs.filter((job) => job.status === "in-progress").length
  const completedThisWeek = jobs.filter((job) => job.status === "completed").length
  const scheduledJobs = jobs.filter((job) => job.status === "planned").length
  const completedJobs = jobs.filter((job) => job.status === "completed")

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Construction Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <Badge variant="secondary" className="text-xs">
                  Admin
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Workers
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Project Overview</h2>
              <div className="text-sm text-slate-600">Job creation is handled by coordinators and schedulers</div>
            </div>
            <ProjectOverview />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Job Management</h2>
              {canCloseJob(user?.role || "") && completedJobs.length > 0 && (
                <div className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-md">
                  <XCircle className="w-4 h-4 inline mr-1" />
                  {completedJobs.length} completed job(s) ready to close
                </div>
              )}
            </div>
            <JobList />
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Worker Management</h2>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Workers
              </Button>
            </div>
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Worker Management</h3>
                <p className="text-slate-600">Worker management features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">WhatsApp Integration</h2>
            </div>

            <Tabs defaultValue="setup" className="space-y-4">
              <TabsList>
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="jobs">Job Management</TabsTrigger>
                <TabsTrigger value="photos">Photo Uploads</TabsTrigger>
              </TabsList>

              <TabsContent value="setup">
                <WhatsAppIntegration />
              </TabsContent>

              <TabsContent value="jobs">
                <WhatsAppJobManager />
              </TabsContent>

              <TabsContent value="photos">
                <WhatsAppPhotoManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Photo Management</h2>
            </div>
            <DrivePhotoOrganizer />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Advanced Reports</h3>
                <p className="text-slate-600">Detailed reporting features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
