"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useJobs } from "@/contexts/job-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhotoUpload } from "@/components/photo-upload"
import { PhotoGallery } from "@/components/photo-gallery"
import { LogOut, Upload, CheckCircle, Clock, AlertCircle, MapPin, Calendar, Camera } from "lucide-react"

export function WorkerDashboard() {
  const { user, logout } = useAuth()
  const { jobs, workUpdates, addWorkUpdate, updateJob, getJobsByWorker, getWorkUpdatesByJob } = useJobs()
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
  const [workUpdate, setWorkUpdate] = useState("")
  const [updateStatus, setUpdateStatus] = useState<"in-progress" | "completed" | "blocked" | "delayed">("in-progress")
  const [hoursWorked, setHoursWorked] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("")
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)

  const workerJobs = getJobsByWorker(user?.id || "4") // Using '4' as worker ID from mock data
  const activeJob = workerJobs.find((job) => job.status === "in-progress")
  const recentUpdates = workUpdates.filter((update) => update.workerId === (user?.id || "4")).slice(0, 5)

  const handleSubmitUpdate = () => {
    if (!workUpdate.trim() || !selectedJobId) return

    // Convert File objects to URLs for demo purposes
    const photoUrls = selectedPhotos.map((file) => URL.createObjectURL(file))

    addWorkUpdate({
      jobId: selectedJobId,
      workerId: user?.id || "4",
      workerName: user?.name || "Field Worker",
      description: workUpdate,
      status: updateStatus,
      photos: photoUrls,
      hoursWorked: hoursWorked ? Number.parseFloat(hoursWorked) : undefined,
    })

    if (updateStatus === "completed") {
      const job = jobs.find((j) => j.id === selectedJobId)
      if (job) {
        updateJob(selectedJobId, {
          status: "completed",
          progress: 100,
        })
      }
    }

    // Reset form
    setWorkUpdate("")
    setSelectedPhotos([])
    setHoursWorked("")
    setUpdateStatus("in-progress")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Worker Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <Badge variant="secondary" className="text-xs">
                  Worker
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeJob ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Current Assignment</CardTitle>
                  <CardDescription>Your active job details</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPhotoGallery(!showPhotoGallery)}>
                  <Camera className="w-4 h-4 mr-2" />
                  {showPhotoGallery ? "Hide" : "View"} Photos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900">{activeJob.title}</h3>
                  <p className="text-sm text-slate-600">{activeJob.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{activeJob.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Due: {activeJob.endDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-100 text-green-800">{activeJob.status.replace("-", " ")}</Badge>
                  <Badge
                    className={`${
                      activeJob.priority === "high"
                        ? "bg-orange-100 text-orange-800"
                        : activeJob.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {activeJob.priority} priority
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{activeJob.progress}%</div>
                    <div className="text-sm text-slate-500">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{activeJob.estimatedDuration}</div>
                    <div className="text-sm text-slate-500">Est. Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{getWorkUpdatesByJob(activeJob.id).length}</div>
                    <div className="text-sm text-slate-500">Updates Sent</div>
                  </div>
                </div>
                {activeJob.progress > 0 && (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${activeJob.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Assignment</h3>
              <p className="text-slate-600">
                You don't have any active jobs assigned. Contact your coordinator for new assignments.
              </p>
            </CardContent>
          </Card>
        )}

        {showPhotoGallery && activeJob && (
          <div className="mb-8">
            <PhotoGallery workUpdates={getWorkUpdatesByJob(activeJob.id)} jobTitle={activeJob.title} />
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Submit Work Update</CardTitle>
            <CardDescription>Upload photos and status updates for your assigned jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="job-select" className="text-sm font-medium text-slate-700">
                Select Job
              </Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a job to update" />
                </SelectTrigger>
                <SelectContent>
                  {workerJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="update-status" className="text-sm font-medium text-slate-700">
                  Work Status
                </Label>
                <Select value={updateStatus} onValueChange={(value) => setUpdateStatus(value as any)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hours-worked" className="text-sm font-medium text-slate-700">
                  Hours Worked (Optional)
                </Label>
                <Input
                  id="hours-worked"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  placeholder="8.0"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="work-update" className="text-sm font-medium text-slate-700">
                Work Description & Status
              </Label>
              <Textarea
                id="work-update"
                placeholder="Describe the work completed, any issues encountered, or progress updates..."
                value={workUpdate}
                onChange={(e) => setWorkUpdate(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <PhotoUpload onPhotosChange={setSelectedPhotos} maxPhotos={8} />

            <Button
              onClick={handleSubmitUpdate}
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={!workUpdate.trim() || !selectedJobId}
            >
              <Upload className="w-4 h-4 mr-2" />
              Submit Update
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Your Recent Updates</CardTitle>
            <CardDescription>History of your submitted work updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUpdates.length > 0 ? (
              <div className="space-y-4">
                {recentUpdates.map((update) => {
                  const job = jobs.find((j) => j.id === update.jobId)
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case "completed":
                        return <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      case "in-progress":
                        return <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      case "blocked":
                        return <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      case "delayed":
                        return <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      default:
                        return <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    }
                  }

                  return (
                    <div key={update.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                      {getStatusIcon(update.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{update.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {job?.title} - {new Date(update.timestamp).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          {update.photos.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Camera className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{update.photos.length} photos attached</span>
                            </div>
                          )}
                          {update.hoursWorked && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{update.hoursWorked} hours</span>
                            </div>
                          )}
                          <Badge
                            className={`text-xs ${
                              update.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : update.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : update.status === "blocked"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {update.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No work updates submitted yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
