import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { jobId, status, hoursWorked, phoneNumber, description } = await request.json()

    // Validate status
    const validStatuses = ["in-progress", "completed", "blocked", "delayed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      )
    }

    // Create work update data
    const updateData = {
      jobId: jobId.trim(),
      workerId: phoneNumber, // Use phone number as worker ID for WhatsApp updates
      workerName: `WhatsApp User (${phoneNumber})`,
      description: description || `Status updated to ${status} via WhatsApp`,
      status: status as "in-progress" | "completed" | "blocked" | "delayed",
      photos: [], // Photos will be handled separately
      hoursWorked: hoursWorked || 0,
      source: "whatsapp" as const,
      phoneNumber,
    }

    console.log("[v0] Creating work update from WhatsApp:", updateData)

    // In a real implementation, you would call your job context here
    // For now, we'll simulate the update creation
    const updateId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      updateId,
      message: "Job updated successfully",
      update: { ...updateData, id: updateId, timestamp: new Date().toISOString() },
    })
  } catch (error) {
    console.error("[v0] Error updating job from WhatsApp:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}
