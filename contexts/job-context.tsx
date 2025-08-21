"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Job, WorkUpdate } from "@/types/job"
import { googleDriveService } from "@/lib/google-drive"

interface JobContextType {
  jobs: Job[]
  workUpdates: WorkUpdate[]
  createJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt">, userRole: string) => Promise<Job>
  updateJob: (id: string, updates: Partial<Job>, userRole: string) => void
  deleteJob: (id: string) => void
  addWorkUpdate: (update: Omit<WorkUpdate, "id" | "timestamp">) => Promise<WorkUpdate>
  getJobById: (id: string) => Job | undefined
  getJobsByWorker: (workerId: string) => Job[]
  getWorkUpdatesByJob: (jobId: string) => WorkUpdate[]
  getJobsByStatus: (status: string) => Job[]
  getJobsByPriority: (priority: string) => Job[]
  searchJobs: (query: string) => Job[]
  getJobStatistics: () => {
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    totalBudget: number
    averageProgress: number
  }
  exportData: () => string
  importData: (data: string) => boolean
  createJobFromWhatsApp: (jobData: any, phoneNumber: string) => Promise<Job>
  uploadPhotoToJob: (jobId: string, photoFile: File, metadata?: any) => Promise<string>
  getJobPhotosFromDrive: (jobId: string) => Promise<any[]>
  canCreateJob: (userRole: string) => boolean
  canCloseJob: (userRole: string) => boolean
  canAssignWorkers: (userRole: string) => boolean
}

const JobContext = createContext<JobContextType | undefined>(undefined)

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Downtown Office Building - Foundation",
    description: "Pour concrete foundation for 12-story office building",
    location: "123 Main St, Downtown",
    status: "in-progress",
    priority: "high",
    startDate: "2024-03-15",
    endDate: "2024-03-25",
    estimatedDuration: 10,
    assignedWorkers: ["4"],
    createdBy: "1",
    createdAt: "2024-03-10T08:00:00Z",
    updatedAt: "2024-03-18T14:30:00Z",
    progress: 75,
    budget: 150000,
    materials: ["Concrete", "Rebar", "Forms"],
    notes: "Weather dependent - monitor forecast",
    driveFolderId: "folder_1", // Example folder ID
  },
  {
    id: "2",
    title: "Residential Complex A - Framing",
    description: "Frame structure for residential units 1-6",
    location: "456 Oak Ave, Suburbs",
    status: "planned",
    priority: "medium",
    startDate: "2024-03-20",
    endDate: "2024-04-05",
    estimatedDuration: 16,
    assignedWorkers: [],
    createdBy: "2",
    createdAt: "2024-03-12T10:00:00Z",
    updatedAt: "2024-03-12T10:00:00Z",
    progress: 0,
    budget: 85000,
    materials: ["Lumber", "Nails", "Hardware"],
    driveFolderId: "folder_2", // Example folder ID
  },
  {
    id: "3",
    title: "Highway Bridge Project - Planning",
    description: "Site preparation and planning for bridge construction",
    location: "Highway 101, Mile Marker 45",
    status: "on-hold",
    priority: "low",
    startDate: "2024-04-01",
    endDate: "2024-04-15",
    estimatedDuration: 14,
    assignedWorkers: [],
    createdBy: "1",
    createdAt: "2024-03-08T09:00:00Z",
    updatedAt: "2024-03-16T11:00:00Z",
    progress: 0,
    budget: 250000,
    notes: "Waiting for environmental permits",
    driveFolderId: "folder_3", // Example folder ID
  },
  {
    id: "4",
    title: "Shopping Mall Renovation - Electrical",
    description: "Upgrade electrical systems throughout the mall",
    location: "789 Commerce Blvd, Mall District",
    status: "completed",
    priority: "high",
    startDate: "2024-02-01",
    endDate: "2024-02-28",
    estimatedDuration: 28,
    assignedWorkers: ["4"],
    createdBy: "1",
    createdAt: "2024-01-25T09:00:00Z",
    updatedAt: "2024-02-28T17:00:00Z",
    progress: 100,
    budget: 95000,
    materials: ["Electrical wire", "Conduit", "Panels", "Fixtures"],
    notes: "Completed ahead of schedule",
    driveFolderId: "folder_4", // Example folder ID
  },
  {
    id: "5",
    title: "School Gymnasium - Roofing",
    description: "Replace and waterproof gymnasium roof",
    location: "321 Education Way, School District",
    status: "in-progress",
    priority: "medium",
    startDate: "2024-03-10",
    endDate: "2024-03-30",
    estimatedDuration: 20,
    assignedWorkers: ["4"],
    createdBy: "2",
    createdAt: "2024-03-05T08:00:00Z",
    updatedAt: "2024-03-19T12:00:00Z",
    progress: 45,
    budget: 120000,
    materials: ["Roofing membrane", "Insulation", "Flashing", "Sealant"],
    driveFolderId: "folder_5", // Example folder ID
  },
]

const mockWorkUpdates: WorkUpdate[] = [
  {
    id: "1",
    jobId: "1",
    workerId: "4",
    workerName: "Field Worker",
    description: "Foundation concrete poured successfully. Weather conditions were optimal.",
    status: "completed",
    photos: ["/concrete-foundation.png"],
    timestamp: "2024-03-18T14:30:00Z",
    hoursWorked: 8,
  },
  {
    id: "2",
    jobId: "1",
    workerId: "4",
    workerName: "Field Worker",
    description: "Rebar installation in progress. About 60% complete.",
    status: "in-progress",
    photos: ["/rebar-installation.png"],
    timestamp: "2024-03-17T16:15:00Z",
    hoursWorked: 6,
  },
  {
    id: "3",
    jobId: "4",
    workerId: "4",
    workerName: "Field Worker",
    description: "Electrical panel installation completed. All circuits tested and operational.",
    status: "completed",
    photos: [],
    timestamp: "2024-02-28T16:00:00Z",
    hoursWorked: 10,
  },
  {
    id: "4",
    jobId: "5",
    workerId: "4",
    workerName: "Field Worker",
    description: "Removed old roofing material. Starting membrane installation tomorrow.",
    status: "in-progress",
    photos: [],
    timestamp: "2024-03-19T15:30:00Z",
    hoursWorked: 7,
  },
]

const STORAGE_KEYS = {
  JOBS: "construction_jobs",
  WORK_UPDATES: "construction_work_updates",
  INITIALIZED: "construction_data_initialized",
}

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([])

  useEffect(() => {
    const initializeData = () => {
      const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED)

      if (!isInitialized) {
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(mockJobs))
        localStorage.setItem(STORAGE_KEYS.WORK_UPDATES, JSON.stringify(mockWorkUpdates))
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true")
        setJobs(mockJobs)
        setWorkUpdates(mockWorkUpdates)
      } else {
        const savedJobs = localStorage.getItem(STORAGE_KEYS.JOBS)
        const savedUpdates = localStorage.getItem(STORAGE_KEYS.WORK_UPDATES)

        if (savedJobs) {
          setJobs(JSON.parse(savedJobs))
        }
        if (savedUpdates) {
          setWorkUpdates(JSON.parse(savedUpdates))
        }
      }
    }

    initializeData()
  }, [])

  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs))
    }
  }, [jobs])

  useEffect(() => {
    if (workUpdates.length > 0) {
      localStorage.setItem(STORAGE_KEYS.WORK_UPDATES, JSON.stringify(workUpdates))
    }
  }, [workUpdates])

  const createJob = async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">, userRole: string): Promise<Job> => {
    if (!canCreateJob(userRole)) {
      throw new Error(`Role ${userRole} is not authorized to create jobs`)
    }

    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      // Create Google Drive folder for this job
      const folderId = await googleDriveService.createJobFolder(newJob.id, newJob.title)
      newJob.driveFolderId = folderId
      console.log("[v0] Created Google Drive folder for job:", newJob.id, folderId)
    } catch (error) {
      console.error("[v0] Failed to create Google Drive folder:", error)
      // Continue without Drive integration if it fails
    }

    setJobs((prev) => [...prev, newJob])
    return newJob
  }

  const updateJob = (id: string, updates: Partial<Job>, userRole: string) => {
    // Only allow admins to close jobs
    if (updates.status === "closed" && !canCloseJob(userRole)) {
      throw new Error(`Role ${userRole} is not authorized to close jobs`)
    }

    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job)),
    )
  }

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id))
    setWorkUpdates((prev) => prev.filter((update) => update.jobId !== id))
  }

  const addWorkUpdate = async (updateData: Omit<WorkUpdate, "id" | "timestamp">): Promise<WorkUpdate> => {
    const newUpdate: WorkUpdate = {
      ...updateData,
      id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }

    // If photos are included, upload them to Google Drive
    if (updateData.photos && updateData.photos.length > 0) {
      const job = jobs.find((j) => j.id === updateData.jobId)
      if (job?.driveFolderId) {
        try {
          const uploadedPhotos = []
          for (const photo of updateData.photos) {
            if (photo instanceof File) {
              const photoUrl = await uploadPhotoToJob(updateData.jobId, photo, {
                workerId: updateData.workerId,
                description: updateData.description,
              })
              uploadedPhotos.push(photoUrl)
            } else {
              uploadedPhotos.push(photo) // Keep existing photo URLs
            }
          }
          newUpdate.photos = uploadedPhotos
        } catch (error) {
          console.error("[v0] Failed to upload photos to Google Drive:", error)
        }
      }
    }

    setWorkUpdates((prev) => [...prev, newUpdate])

    const job = jobs.find((j) => j.id === updateData.jobId)
    if (job && updateData.status === "completed") {
      const jobUpdates = workUpdates.filter((u) => u.jobId === updateData.jobId)
      const completedUpdates = jobUpdates.filter((u) => u.status === "completed").length + 1
      const totalUpdates = jobUpdates.length + 1
      const newProgress = Math.min(100, Math.round((completedUpdates / totalUpdates) * 100))

      updateJob(updateData.jobId, {
        progress: newProgress,
        status: newProgress === 100 ? "completed" : job.status,
      })
    }

    return newUpdate
  }

  const getJobById = (id: string) => jobs.find((job) => job.id === id)

  const getJobsByWorker = (workerId: string) => jobs.filter((job) => job.assignedWorkers.includes(workerId))

  const getWorkUpdatesByJob = (jobId: string) => workUpdates.filter((update) => update.jobId === jobId)

  const getJobsByStatus = (status: string) => jobs.filter((job) => job.status === status)

  const getJobsByPriority = (priority: string) => jobs.filter((job) => job.priority === priority)

  const searchJobs = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowercaseQuery) ||
        job.description.toLowerCase().includes(lowercaseQuery) ||
        job.location.toLowerCase().includes(lowercaseQuery) ||
        job.materials?.some((material) => material.toLowerCase().includes(lowercaseQuery)) ||
        job.notes?.toLowerCase().includes(lowercaseQuery),
    )
  }

  const getJobStatistics = () => {
    const total = jobs.length
    const byStatus = jobs.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const byPriority = jobs.reduce(
      (acc, job) => {
        acc[job.priority] = (acc[job.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const totalBudget = jobs.reduce((sum, job) => sum + (job.budget || 0), 0)
    const averageProgress =
      jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + job.progress, 0) / jobs.length) : 0

    return {
      total,
      byStatus,
      byPriority,
      totalBudget,
      averageProgress,
    }
  }

  const exportData = () => {
    const exportObject = {
      jobs,
      workUpdates,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }
    return JSON.stringify(exportObject, null, 2)
  }

  const importData = (data: string) => {
    try {
      const importObject = JSON.parse(data)
      if (importObject.jobs && importObject.workUpdates) {
        setJobs(importObject.jobs)
        setWorkUpdates(importObject.workUpdates)
        return true
      }
      return false
    } catch (error) {
      console.error("Import failed:", error)
      return false
    }
  }

  const createJobFromWhatsApp = async (jobData: any, phoneNumber: string): Promise<Job> => {
    const job = await createJob({
      ...jobData,
      createdBy: phoneNumber,
      createdVia: "whatsapp",
      assignedWorkers: [], // Will be assigned later by admin
    })

    console.log("[v0] Job created from WhatsApp:", job.id)
    return job
  }

  const uploadPhotoToJob = async (jobId: string, photoFile: File, metadata?: any): Promise<string> => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job?.driveFolderId) {
      throw new Error("Job does not have a Google Drive folder")
    }

    try {
      const buffer = await photoFile.arrayBuffer()
      const photoUrl = await googleDriveService.uploadPhoto(
        job.driveFolderId,
        photoFile.name,
        Buffer.from(buffer),
        photoFile.type,
        {
          ...metadata,
          timestamp: new Date().toISOString(),
          jobId: jobId,
        },
      )

      console.log("[v0] Photo uploaded to Google Drive:", photoUrl)
      return photoUrl
    } catch (error) {
      console.error("[v0] Failed to upload photo:", error)
      throw error
    }
  }

  const getJobPhotosFromDrive = async (jobId: string): Promise<any[]> => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job?.driveFolderId) {
      return []
    }

    try {
      return await googleDriveService.getJobPhotos(job.driveFolderId)
    } catch (error) {
      console.error("[v0] Failed to get job photos:", error)
      return []
    }
  }

  const canCreateJob = (userRole: string) => {
    return userRole === "coordinator" || userRole === "scheduler"
  }

  const canCloseJob = (userRole: string) => {
    return userRole === "admin"
  }

  const canAssignWorkers = (userRole: string) => {
    return userRole === "scheduler" || userRole === "admin"
  }

  return (
    <JobContext.Provider
      value={{
        jobs,
        workUpdates,
        createJob,
        updateJob,
        deleteJob,
        addWorkUpdate,
        getJobById,
        getJobsByWorker,
        getWorkUpdatesByJob,
        getJobsByStatus,
        getJobsByPriority,
        searchJobs,
        getJobStatistics,
        exportData,
        importData,
        createJobFromWhatsApp,
        uploadPhotoToJob,
        getJobPhotosFromDrive,
        canCreateJob,
        canCloseJob,
        canAssignWorkers,
      }}
    >
      {children}
    </JobContext.Provider>
  )
}

export function useJobs() {
  const context = useContext(JobContext)
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobProvider")
  }
  return context
}
