import { google } from "googleapis"

export class GoogleDriveService {
  private drive: any

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    })

    this.drive = google.drive({ version: "v3", auth })
  }

  async createJobFolder(jobId: string, jobName: string): Promise<string> {
    try {
      const folderName = `${jobId}-${jobName.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}`

      const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || "root"],
      }

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: "id",
      })

      console.log("[v0] Created Google Drive folder:", folderName, "ID:", folder.data.id)
      return folder.data.id
    } catch (error) {
      console.error("[v0] Error creating Google Drive folder:", error)
      throw error
    }
  }

  async uploadPhoto(
    folderId: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    metadata?: { caption?: string; uploadedBy?: string; timestamp?: string },
  ): Promise<string> {
    try {
      const fileMetadata = {
        name: `${new Date().toISOString().split("T")[0]}_${fileName}`,
        parents: [folderId],
        description: metadata ? JSON.stringify(metadata) : undefined,
      }

      const media = {
        mimeType: mimeType,
        body: Buffer.from(fileBuffer),
      }

      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id,webViewLink",
      })

      console.log("[v0] Uploaded photo to Google Drive:", file.data.id)
      return file.data.webViewLink
    } catch (error) {
      console.error("[v0] Error uploading photo to Google Drive:", error)
      throw error
    }
  }

  async getJobPhotos(folderId: string): Promise<any[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/'`,
        fields: "files(id,name,webViewLink,createdTime,description)",
      })

      return response.data.files || []
    } catch (error) {
      console.error("[v0] Error getting job photos:", error)
      throw error
    }
  }

  async downloadWhatsAppImage(imageId: string, accessToken: string): Promise<Buffer> {
    try {
      console.log("[v0] Downloading WhatsApp image:", imageId)

      // First get the image URL from WhatsApp API
      const imageResponse = await fetch(`https://graph.facebook.com/v18.0/${imageId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!imageResponse.ok) {
        throw new Error(`Failed to get image URL: ${imageResponse.statusText}`)
      }

      const imageData = await imageResponse.json()
      console.log("[v0] Got image URL from WhatsApp:", imageData.url)

      // Download the actual image
      const downloadResponse = await fetch(imageData.url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!downloadResponse.ok) {
        throw new Error(`Failed to download image: ${downloadResponse.statusText}`)
      }

      const arrayBuffer = await downloadResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      console.log("[v0] Successfully downloaded WhatsApp image, size:", buffer.length, "bytes")
      return buffer
    } catch (error) {
      console.error("[v0] Error downloading WhatsApp image:", error)
      throw error
    }
  }
}

export const googleDriveService = new GoogleDriveService()
