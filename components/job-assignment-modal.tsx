"use client"

import { useState } from "react"
import { useJobs } from "@/contexts/job-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Users, Briefcase } from "lucide-react"
import type { Job } from "@/types/job"

interface JobAssignmentModalProps {
  job: Job
  onClose: () => void
}

// Mock workers data
const mockWorkers = [
  {
    id: "4",
    name: "Field Worker",
    email: "worker@construction.com",
    specialty: "General Construction",
    available: true,
  },
  { id: "5", name: "John Smith", email: "john@construction.com", specialty: "Foundation Specialist", available: true },
  { id: "6", name: "Mike Johnson", email: "mike@construction.com", specialty: "Framing Crew Lead", available: false },
  { id: "7", name: "Sarah Davis", email: "sarah@construction.com", specialty: "Equipment Operator", available: true },
  { id: "8", name: "Tom Wilson", email: "tom@construction.com", specialty: "Safety Inspector", available: true },
  { id: "9", name: "Lisa Brown", email: "lisa@construction.com", specialty: "Electrical Specialist", available: true },
]

export function JobAssignmentModal({ job, onClose }: JobAssignmentModalProps) {
  const { updateJob } = useJobs()
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(job.assignedWorkers)

  const handleWorkerToggle = (workerId: string) => {
    setSelectedWorkers((prev) => (prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]))
  }

  const handleSaveAssignments = () => {
    updateJob(job.id, { assignedWorkers: selectedWorkers })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Assign Workers</CardTitle>
              <CardDescription>{job.title}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-900">Job Details</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">{job.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500">Location: {job.location}</span>
              <span className="text-slate-500">Duration: {job.estimatedDuration} days</span>
              <Badge
                className={
                  job.priority === "urgent"
                    ? "bg-red-100 text-red-800"
                    : job.priority === "high"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                }
              >
                {job.priority} priority
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-900">Available Workers</span>
              <Badge variant="secondary">{selectedWorkers.length} selected</Badge>
            </div>

            <div className="space-y-3">
              {mockWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    worker.available ? "bg-white" : "bg-slate-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedWorkers.includes(worker.id)}
                      onCheckedChange={() => handleWorkerToggle(worker.id)}
                      disabled={!worker.available}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{worker.name}</p>
                      <p className="text-sm text-slate-600">{worker.specialty}</p>
                      <p className="text-xs text-slate-500">{worker.email}</p>
                    </div>
                  </div>
                  <Badge className={worker.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {worker.available ? "Available" : "Busy"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveAssignments} className="flex-1 bg-orange-600 hover:bg-orange-700">
              Save Assignments ({selectedWorkers.length} workers)
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
