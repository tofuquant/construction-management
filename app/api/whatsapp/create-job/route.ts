import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, location, priority, phoneNumber, description } = await request.json()

    // Here you would integrate with your job context
    // For now, we'll simulate the job creation
    const jobData = {
      title: title.trim(),
      description: description || `Job created via WhatsApp from ${phoneNumber}`,
      location: location.trim(),
      priority: priority.toLowerCase() as "high" | "medium" | "low",
      status: "planned" as const,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      estimatedDuration: 7,
      assignedWorkers: [],
      createdBy: phoneNumber,
      progress: 0,
    }

    // In a real implementation, you would call your job context here
    console.log("[v0] Creating job from WhatsApp:", jobData)

    // Simulate job creation and return job ID
    const jobId = `J${Date.now().toString().slice(-6)}`

    return NextResponse.json({
      success: true,
      jobId,
      message: "Job created successfully",
      job: { ...jobData, id: jobId },
    })
  } catch (error) {
    console.error("[v0] Error creating job from WhatsApp:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
