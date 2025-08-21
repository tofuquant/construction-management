"use client"

import { useState } from "react"
import { useJobs } from "@/contexts/job-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhotoGallery } from "@/components/photo-gallery"
import { JobAssignmentModal } from "@/components/job-assignment-modal"
import { X, Edit, Users, MapPin, Calendar, DollarSign, Clock, Camera, Trash2 } from "lucide-react"
import type { Job } from "@/types/job"

interface JobDetailsModalProps {
  job: Job
  onClose: () => void
}

export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  const { updateJob, deleteJob, getWorkUpdatesByJob } = useJobs()
  const [isEditing, setIsEditing] = useState(false)
  const [showAssignments, setShowAssignments] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [editData, setEditData] = useState({
    title: job.title,
    description: job.description,
    location: job.location,
    priority: job.priority,
    status: job.status,
    progress: job.progress,
    budget: job.budget?.toString() || "",
    notes: job.notes || "",
  })

  const workUpdates = getWorkUpdatesByJob(job.id)
  const assignedWorkerNames = ["Field Worker", "John Smith", "Sarah Davis"] // Mock data

  const handleSave = () => {
    updateJob(job.id, {
      ...editData,
      budget: editData.budget ? Number.parseFloat(editData.budget) : undefined,
      notes: editData.notes || undefined,
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      deleteJob(job.id)
      onClose()
    }
  }

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: Job["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                    className="text-xl font-bold"
                  />
                ) : (
                  <CardTitle className="text-xl font-bold text-slate-900">{job.title}</CardTitle>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(job.status)}>{job.status.replace("-", " ")}</Badge>
                  <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                  {job.assignedWorkers.length > 0 && (
                    <Badge variant="secondary">{job.assignedWorkers.length} workers assigned</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAssignments(true)}>
                      <Users className="w-4 h-4 mr-2" />
                      Assign Workers
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowPhotos(!showPhotos)}>
                      <Camera className="w-4 h-4 mr-2" />
                      Photos ({workUpdates.reduce((acc, update) => acc + update.photos.length, 0)})
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-slate-600 mt-1">{job.description}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Location</Label>
                  {isEditing ? (
                    <Input
                      value={editData.location}
                      onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{job.location}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Priority</Label>
                    {isEditing ? (
                      <Select
                        value={editData.priority}
                        onValueChange={(value) =>
                          setEditData((prev) => ({ ...prev, priority: value as Job["priority"] }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-slate-600 mt-1 capitalize">{job.priority}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700">Status</Label>
                    {isEditing ? (
                      <Select
                        value={editData.status}
                        onValueChange={(value) => setEditData((prev) => ({ ...prev, status: value as Job["status"] }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-slate-600 mt-1 capitalize">{job.status.replace("-", " ")}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Start Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{job.startDate}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700">End Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{job.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Duration</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{job.estimatedDuration} days</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700">Budget</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.budget}
                        onChange={(e) => setEditData((prev) => ({ ...prev, budget: e.target.value }))}
                        className="mt-1"
                        placeholder="Optional"
                      />
                    ) : job.budget ? (
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">${job.budget.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 mt-1">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Progress</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editData.progress}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, progress: Number.parseInt(e.target.value) || 0 }))
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Completion</span>
                        <span className="font-medium text-slate-900">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Workers */}
            {job.assignedWorkers.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-slate-700">Assigned Workers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {assignedWorkerNames.map((name, index) => (
                    <Badge key={index} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {job.materials && job.materials.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-slate-700">Materials</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.materials.map((material, index) => (
                    <Badge key={index} variant="outline">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium text-slate-700">Notes</Label>
              {isEditing ? (
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="mt-1"
                  placeholder="Additional notes..."
                />
              ) : job.notes ? (
                <p className="text-sm text-slate-600 mt-1">{job.notes}</p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">No notes</p>
              )}
            </div>

            {/* Work Updates Summary */}
            {workUpdates.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-slate-700">Recent Updates</Label>
                <div className="mt-2 space-y-2">
                  {workUpdates.slice(0, 3).map((update) => (
                    <div key={update.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">{update.workerName}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(update.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{update.description}</p>
                    </div>
                  ))}
                  {workUpdates.length > 3 && (
                    <p className="text-xs text-slate-500">And {workUpdates.length - 3} more updates...</p>
                  )}
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {showPhotos && workUpdates.some((update) => update.photos.length > 0) && (
              <PhotoGallery workUpdates={workUpdates} jobTitle={job.title} />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="destructive" onClick={handleDelete} className="ml-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Job
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showAssignments && <JobAssignmentModal job={job} onClose={() => setShowAssignments(false)} />}
    </>
  )
}
