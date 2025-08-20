import { type NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[v0] WhatsApp webhook verified successfully")
    return new NextResponse(challenge)
  } else {
    console.log("[v0] WhatsApp webhook verification failed")
    return new NextResponse("Forbidden", { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] WhatsApp webhook received:", JSON.stringify(body, null, 2))

    // Process WhatsApp messages
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const messages = body.entry[0].changes[0].value.messages

      for (const message of messages) {
        await processWhatsAppMessage(message, body.entry[0].changes[0].value)
      }
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("[v0] WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processWhatsAppMessage(message: any, value: any) {
  const phoneNumber = message.from
  const messageType = message.type

  console.log("[v0] Processing message from:", phoneNumber, "type:", messageType)

  if (messageType === "text") {
    const text = message.text.body.toLowerCase()

    // Handle job creation commands
    if (text.startsWith("create job")) {
      await handleJobCreation(phoneNumber, text)
    }
    // Handle status updates
    else if (text.startsWith("update job")) {
      await handleJobUpdate(phoneNumber, text)
    }
    // Handle help command
    else if (text === "help") {
      await sendWhatsAppMessage(phoneNumber, getHelpMessage())
    }
    // Handle image upload with job ID specification
    else if (text.startsWith("upload to")) {
      const [, jobId] = text.match(/upload to (\w+)/i) || []
      if (jobId) {
        await handleImageUploadWithJobId(message, phoneNumber, jobId.toUpperCase())
      } else {
        await sendWhatsAppMessage(
          phoneNumber,
          `❌ Invalid format. Use: "upload to [JobID]"\n\nExample: "upload to J001"`,
        )
      }
    }
  }

  // Handle image uploads
  if (messageType === "image") {
    await handleImageUpload(message, phoneNumber)
  }
}

async function handleJobCreation(phoneNumber: string, text: string) {
  // Parse job creation command: "create job [title] at [location] priority [high/medium/low/urgent]"
  const jobMatch = text.match(/create job (.+?) at (.+?) priority (high|medium|low|urgent)/i)

  if (jobMatch) {
    const [, title, location, priority] = jobMatch

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/whatsapp/create-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          location: location.trim(),
          priority: priority.toLowerCase(),
          phoneNumber,
          description: `Job created via WhatsApp by ${phoneNumber}`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await sendWhatsAppMessage(
          phoneNumber,
          `✅ Job created successfully!\n\nJob ID: ${result.jobId}\nTitle: ${title}\nLocation: ${location}\nPriority: ${priority}\n\nGoogle Drive folder created for photos.\nAdmins will assign workers shortly.`,
        )
      } else {
        throw new Error(result.error || "Failed to create job")
      }
    } catch (error) {
      console.error("[v0] Error creating job:", error)
      await sendWhatsAppMessage(
        phoneNumber,
        `❌ Failed to create job. Please try again or contact support.\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  } else {
    await sendWhatsAppMessage(
      phoneNumber,
      `❌ Invalid format. Use: "create job [title] at [location] priority [high/medium/low/urgent]"\n\nExample: "create job Foundation Work at 123 Main St priority high"`,
    )
  }
}

async function handleJobUpdate(phoneNumber: string, text: string) {
  // Parse job update command: "update job [id] status [status] hours [hours]"
  const updateMatch = text.match(/update job (\w+) status ([\w\s-]+?)(?:\s+hours\s+(\d+))?$/i)

  if (updateMatch) {
    const [, jobId, status, hours] = updateMatch

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/whatsapp/update-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobId.trim(),
          status: status.trim(),
          hoursWorked: hours ? Number.parseInt(hours) : undefined,
          phoneNumber,
          description: `Status updated via WhatsApp by ${phoneNumber}`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await sendWhatsAppMessage(
          phoneNumber,
          `✅ Job ${jobId} updated successfully!\n\nStatus: ${status}${hours ? `\nHours: ${hours}` : ""}\n\nSend photos to document the work progress.`,
        )
      } else {
        throw new Error(result.error || "Failed to update job")
      }
    } catch (error) {
      console.error("[v0] Error updating job:", error)
      await sendWhatsAppMessage(
        phoneNumber,
        `❌ Failed to update job ${jobId}. Please check the job ID and try again.\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  } else {
    await sendWhatsAppMessage(
      phoneNumber,
      `❌ Invalid format. Use: "update job [ID] status [status] hours [hours]"\n\nValid statuses: in-progress, completed, blocked, delayed\nExample: "update job J001 status in-progress hours 4"`,
    )
  }
}

async function handleImageUpload(message: any, phoneNumber: string) {
  const imageId = message.image.id
  const caption = message.image.caption || "Work progress photo"

  console.log("[v0] Handling image upload:", { imageId, caption, phoneNumber })

  // Try to extract job ID from caption (format: "J001 Foundation work completed")
  const jobIdMatch = caption.match(/^([JjWw]\d+)/i)
  let jobId = null

  if (jobIdMatch) {
    jobId = jobIdMatch[1].toUpperCase()
  }

  // If no job ID in caption, ask user to specify
  if (!jobId) {
    await sendWhatsAppMessage(
      phoneNumber,
      `📸 Photo received! To upload to the correct job folder, please include the Job ID at the start of your caption.\n\nExample: "J001 Foundation work completed"\n\nOr reply with: "upload to [JobID]" to specify the job.`,
    )
    return
  }

  // Process the photo upload
  const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/whatsapp/upload-photo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageId,
      jobId,
      phoneNumber,
      caption: caption.replace(/^[JjWw]\d+\s*/i, "").trim(), // Remove job ID from caption
    }),
  })

  const result = await response.json()

  if (result.success) {
    await sendWhatsAppMessage(
      phoneNumber,
      `✅ Photo uploaded successfully to Google Drive!\n\nJob: ${jobId}\nCaption: ${result.caption}\nFolder: ${result.folderName}\n\nPhoto is now available in the job dashboard.`,
    )
  } else {
    throw new Error(result.error || "Failed to upload photo")
  }
}

async function handleImageUploadWithJobId(message: any, phoneNumber: string, jobId: string) {
  const imageId = message.image.id
  const caption = message.image.caption || "Work progress photo"

  console.log("[v0] Handling image upload with job ID:", { imageId, caption, phoneNumber, jobId })

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/whatsapp/upload-photo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId,
        jobId,
        phoneNumber,
        caption: caption.trim(),
      }),
    })

    const result = await response.json()

    if (result.success) {
      await sendWhatsAppMessage(
        phoneNumber,
        `✅ Photo uploaded successfully to Google Drive!\n\nJob: ${jobId}\nCaption: ${result.caption}\nFolder: ${result.folderName}\n\nPhoto is now available in the job dashboard.`,
      )
    } else {
      throw new Error(result.error || "Failed to upload photo")
    }
  } catch (error) {
    console.error("[v0] Error uploading photo:", error)
    await sendWhatsAppMessage(
      phoneNumber,
      `❌ Failed to upload photo. Please try again.\n\nError: ${error instanceof Error ? error.message : "Unknown error"}\n\nMake sure to include the Job ID in your caption (e.g., "J001 Work completed")`,
    )
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    console.error("[v0] WhatsApp credentials not configured")
    return
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }

    console.log("[v0] WhatsApp message sent successfully")
  } catch (error) {
    console.error("[v0] Failed to send WhatsApp message:", error)
  }
}

function getHelpMessage(): string {
  return `🔧 Construction Management Commands:

📋 CREATE JOB:
"create job [title] at [location] priority [high/medium/low/urgent]"

📊 UPDATE JOB:
"update job [ID] status [status] hours [hours]"

📸 UPLOAD PHOTOS:
Send images with Job ID in caption: "[JobID] Description"
Example: "J001 Foundation work completed"

💡 EXAMPLES:
• create job Foundation Work at 123 Main St priority high
• update job J001 status in-progress hours 4
• Send photo with caption "J001 Concrete pour completed"

Type "help" anytime for this menu.`
}
