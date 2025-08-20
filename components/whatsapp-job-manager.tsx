"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageSquare, Plus, Phone } from "lucide-react"
import { useJobs } from "@/contexts/job-context"

export function WhatsAppJobManager() {
  const { jobs, createJobFromWhatsApp } = useJobs()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobLocation, setJobLocation] = useState("")
  const [jobPriority, setJobPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [isCreating, setIsCreating] = useState(false)

  const whatsappJobs = jobs.filter((job) => job.createdVia === "whatsapp")

  const handleCreateJob = async () => {
    if (!phoneNumber || !jobTitle || !jobLocation) return

    setIsCreating(true)
    try {
      await createJobFromWhatsApp(
        {
          title: jobTitle,
          description: `Job created via WhatsApp simulation from ${phoneNumber}`,
          location: jobLocation,
          priority: jobPriority,
          status: "planned" as const,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          estimatedDuration: 7,
          assignedWorkers: [],
          progress: 0,
        },
        phoneNumber,
      )

      // Reset form
      setJobTitle("")
      setJobLocation("")
      setPhoneNumber("")
      setJobPriority("medium")
    } catch (error) {
      console.error("[v0] Failed to create job:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Job Creation Simulator
          </CardTitle>
          <CardDescription>
            Simulate job creation via WhatsApp messages (for testing without actual WhatsApp integration)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input placeholder="+1234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                className="w-full p-2 border rounded-md"
                value={jobPriority}
                onChange={(e) => setJobPriority(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input placeholder="Foundation Work" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              placeholder="123 Main St, Downtown"
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCreateJob}
            disabled={!phoneNumber || !jobTitle || !jobLocation || isCreating}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creating Job..." : "Create Job via WhatsApp"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jobs Created via WhatsApp</CardTitle>
          <CardDescription>
            {whatsappJobs.length} job{whatsappJobs.length !== 1 ? "s" : ""} created through WhatsApp integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatsappJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No jobs created via WhatsApp yet</p>
          ) : (
            <div className="space-y-3">
              {whatsappJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <Badge
                        variant={job.priority === "high" || job.priority === "urgent" ? "destructive" : "secondary"}
                      >
                        {job.priority}
                      </Badge>
                      <Badge variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                    <p className="text-xs text-muted-foreground">Created by: {job.createdBy}</p>
                  </div>
                  <Badge
                    variant={
                      job.status === "completed"
                        ? "default"
                        : job.status === "in-progress"
                          ? "secondary"
                          : job.status === "on-hold"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
