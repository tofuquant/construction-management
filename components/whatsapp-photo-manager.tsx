"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Camera, Upload, FolderOpen, MessageSquare } from "lucide-react"
import { useJobs } from "@/contexts/job-context"

export function WhatsAppPhotoManager() {
  const { jobs, workUpdates } = useJobs()
  const [selectedJobId, setSelectedJobId] = useState("")
  const [photoCaption, setPhotoCaption] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const whatsappUpdates = workUpdates.filter((update) => update.source === "whatsapp" && update.photos.length > 0)

  const handleSimulatePhotoUpload = async () => {
    if (!selectedJobId || !photoCaption || !phoneNumber) return

    setIsUploading(true)
    try {
      // Simulate photo upload via WhatsApp
      const response = await fetch("/api/whatsapp/upload-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: `sim_${Date.now()}`, // Simulated image ID
          jobId: selectedJobId,
          phoneNumber,
          caption: photoCaption,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Reset form
        setPhotoCaption("")
        setPhoneNumber("")
        setSelectedJobId("")
        alert("Photo upload simulated successfully!")
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Failed to simulate photo upload:", error)
      alert("Failed to simulate photo upload")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            WhatsApp Photo Upload Simulator
          </CardTitle>
          <CardDescription>
            Simulate photo uploads via WhatsApp with automatic Google Drive organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input placeholder="+1234567890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job ID</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.id} - {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Photo Caption</label>
            <Input
              placeholder="Foundation work completed - ready for next phase"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <strong>WhatsApp Format:</strong> Send photo with caption: "{selectedJobId} {photoCaption}"
          </div>

          <Button
            onClick={handleSimulatePhotoUpload}
            disabled={!selectedJobId || !photoCaption || !phoneNumber || isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Simulate Photo Upload"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-green-600" />
            Photos Uploaded via WhatsApp
          </CardTitle>
          <CardDescription>
            {whatsappUpdates.length} photo update{whatsappUpdates.length !== 1 ? "s" : ""} received through WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatsappUpdates.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No photos uploaded via WhatsApp yet</p>
          ) : (
            <div className="space-y-4">
              {whatsappUpdates.map((update) => {
                const job = jobs.find((j) => j.id === update.jobId)
                return (
                  <div key={update.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{job?.title || `Job ${update.jobId}`}</h4>
                          <Badge variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{update.description}</p>
                        <p className="text-xs text-muted-foreground">
                          From: {update.phoneNumber} • {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>
                        {update.photos.length} photo{update.photos.length !== 1 ? "s" : ""} uploaded to Google Drive
                      </span>
                    </div>

                    {update.photos.length > 0 && (
                      <div className="mt-2 text-xs text-blue-600">
                        Organized in folder: {update.jobId}-
                        {job?.title?.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo Upload Instructions</CardTitle>
          <CardDescription>How workers should upload photos via WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Include Job ID in Caption:</strong>
              <div className="bg-muted p-2 rounded mt-1">Send photo with caption: "J001 Foundation work completed"</div>
            </div>

            <div>
              <strong>2. Automatic Organization:</strong>
              <div className="bg-muted p-2 rounded mt-1">
                Photos are automatically saved to Google Drive in job-specific folders
              </div>
            </div>

            <div>
              <strong>3. Folder Structure:</strong>
              <div className="bg-muted p-2 rounded mt-1">JobID-JobName (e.g., "J001-Foundation_Work")</div>
            </div>

            <div>
              <strong>4. Error Handling:</strong>
              <div className="bg-muted p-2 rounded mt-1">
                If Job ID is missing or invalid, the system will ask for clarification
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
