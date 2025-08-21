export interface Job {
  id: string
  title: string
  description: string
  location: string
  status: "planned" | "in-progress" | "completed" | "on-hold"
  priority: "low" | "medium" | "high" | "urgent"
  startDate: string
  endDate: string
  estimatedDuration: number // in days
  assignedWorkers: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  progress: number // 0-100
  budget?: number
  materials?: string[]
  notes?: string
  driveFolderId?: string // Google Drive folder ID for job photos
  createdVia?: "web" | "whatsapp" | "api" // Track creation source
}

export interface WorkUpdate {
  id: string
  jobId: string
  workerId: string
  workerName: string
  description: string
  status: "in-progress" | "completed" | "blocked" | "delayed"
  photos: string[]
  timestamp: string
  hoursWorked?: number
  source?: "web" | "whatsapp" // Track update source
  phoneNumber?: string // For WhatsApp updates
}
