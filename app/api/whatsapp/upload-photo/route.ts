import { type NextRequest, NextResponse } from "next/server"
import { googleDriveService } from "@/lib/google-drive"

export async function POST(request: NextRequest) {
  try {
    const { imageId, jobId, phoneNumber, caption } = await request.json()

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "WhatsApp access token not configured" }, { status: 500 })
    }

    console.log("[v0] Processing WhatsApp photo upload:", { imageId, jobId, phoneNumber, caption })

    // First, validate that the job exists (in a real app, you'd query your database)
    // For now, we'll simulate job validation
    const jobExists = await validateJob(jobId)
    if (!jobExists.valid) {
      return NextResponse.json(
        {
          error: `Job ${jobId} not found. Please check the Job ID and try again.`,
          availableJobs: jobExists.suggestions,
        },
        { status: 404 },
      )
    }

    try {
      // Download image from WhatsApp
      const imageBuffer = await googleDriveService.downloadWhatsAppImage(imageId, accessToken)

      // Create or get job folder
      const folderName = `${jobId}-${jobExists.jobName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}`
      const folderId = await googleDriveService.createJobFolder(jobId, jobExists.jobName)

      // Upload photo to Google Drive with metadata
      const photoUrl = await googleDriveService.uploadPhoto(
        folderId,
        `whatsapp_${Date.now()}.jpg`,
        imageBuffer,
        "image/jpeg",
        {
          caption: caption || "Work progress photo",
          uploadedBy: phoneNumber,
          timestamp: new Date().toISOString(),
          source: "whatsapp",
          jobId: jobId,
          originalImageId: imageId,
        },
      )

      // Create work update entry (in a real app, you'd save this to your database)
      const workUpdate = {
        id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jobId: jobId,
        workerId: phoneNumber,
        workerName: `WhatsApp User (${phoneNumber})`,
        description: caption || "Photo uploaded via WhatsApp",
        status: "in-progress" as const,
        photos: [photoUrl],
        timestamp: new Date().toISOString(),
        source: "whatsapp",
        phoneNumber: phoneNumber,
      }

      console.log("[v0] Photo uploaded successfully:", { photoUrl, workUpdate })

      return NextResponse.json({
        success: true,
        photoUrl,
        folderName,
        caption: caption || "Work progress photo",
        workUpdate,
        message: "Photo uploaded to Google Drive successfully",
      })
    } catch (uploadError) {
      console.error("[v0] Error during photo upload process:", uploadError)
      return NextResponse.json(
        {
          error: "Failed to process photo upload. Please try again.",
          details: uploadError instanceof Error ? uploadError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Error in photo upload API:", error)
    return NextResponse.json(
      {
        error: "Internal server error during photo upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function validateJob(jobId: string): Promise<{ valid: boolean; jobName?: string; suggestions?: string[] }> {
  // In a real implementation, this would query your database
  // For now, we'll simulate with some mock job validation
  const mockJobs = [
    { id: "J001", name: "Downtown Office Building Foundation" },
    { id: "J002", name: "Residential Complex A Framing" },
    { id: "J003", name: "Highway Bridge Project Planning" },
    { id: "J004", name: "Shopping Mall Renovation Electrical" },
    { id: "J005", name: "School Gymnasium Roofing" },
  ]

  const job = mockJobs.find((j) => j.id.toUpperCase() === jobId.toUpperCase())

  if (job) {
    return { valid: true, jobName: job.name }
  }

  // Return suggestions for similar job IDs
  const suggestions = mockJobs
    .filter((j) => j.id.includes(jobId.slice(-2)) || jobId.includes(j.id.slice(-2)))
    .map((j) => j.id)
    .slice(0, 3)

  return {
    valid: false,
    suggestions: suggestions.length > 0 ? suggestions : mockJobs.map((j) => j.id).slice(0, 3),
  }
}
