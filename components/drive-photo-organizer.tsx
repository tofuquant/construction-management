"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderOpen, ImageIcon, Download, ExternalLink, Search, Calendar, User } from "lucide-react"
import { useJobs } from "@/contexts/job-context"

interface DrivePhoto {
  id: string
  name: string
  webViewLink: string
  createdTime: string
  description?: string
  metadata?: {
    caption?: string
    uploadedBy?: string
    timestamp?: string
    source?: string
    jobId?: string
  }
}

interface JobFolder {
  jobId: string
  jobTitle: string
  folderName: string
  folderId: string
  photoCount: number
  lastUpdated: string
  photos: DrivePhoto[]
}

export function DrivePhotoOrganizer() {
  const { jobs, workUpdates } = useJobs()
  const [jobFolders, setJobFolders] = useState<JobFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<JobFolder | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Simulate Google Drive folder structure based on jobs
  useEffect(() => {
    const folders: JobFolder[] = jobs.map((job) => {
      const jobUpdates = workUpdates.filter((update) => update.jobId === job.id && update.photos.length > 0)
      const folderName = `${job.id}-${job.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}`

      // Simulate photos from work updates
      const photos: DrivePhoto[] = jobUpdates.flatMap((update, index) =>
        update.photos.map((photoUrl, photoIndex) => ({
          id: `photo_${job.id}_${index}_${photoIndex}`,
          name: `${new Date(update.timestamp).toISOString().split("T")[0]}_photo_${photoIndex + 1}.jpg`,
          webViewLink: photoUrl,
          createdTime: update.timestamp,
          description: JSON.stringify({
            caption: update.description,
            uploadedBy: update.phoneNumber || update.workerId,
            timestamp: update.timestamp,
            source: update.source || "web",
            jobId: job.id,
          }),
          metadata: {
            caption: update.description,
            uploadedBy: update.phoneNumber || update.workerId,
            timestamp: update.timestamp,
            source: update.source || "web",
            jobId: job.id,
          },
        })),
      )

      return {
        jobId: job.id,
        jobTitle: job.title,
        folderName,
        folderId: job.driveFolderId || `folder_${job.id}`,
        photoCount: photos.length,
        lastUpdated:
          photos.length > 0
            ? Math.max(...photos.map((p) => new Date(p.createdTime).getTime())).toString()
            : job.updatedAt,
        photos,
      }
    })

    setJobFolders(folders)
  }, [jobs, workUpdates])

  const filteredFolders = jobFolders.filter(
    (folder) =>
      folder.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.folderName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalPhotos = jobFolders.reduce((sum, folder) => sum + folder.photoCount, 0)
  const foldersWithPhotos = jobFolders.filter((folder) => folder.photoCount > 0).length

  const handleViewFolder = async (folder: JobFolder) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch photos from Google Drive API
      // For now, we'll use the simulated data
      setSelectedFolder(folder)
    } catch (error) {
      console.error("[v0] Error loading folder photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPhoto = (photo: DrivePhoto) => {
    // In a real implementation, this would download from Google Drive
    window.open(photo.webViewLink, "_blank")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Google Drive Photo Organization
          </CardTitle>
          <CardDescription>Photos automatically organized by Job ID and Name in Google Drive folders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{jobFolders.length}</div>
              <div className="text-sm text-muted-foreground">Total Job Folders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{foldersWithPhotos}</div>
              <div className="text-sm text-muted-foreground">Folders with Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalPhotos}</div>
              <div className="text-sm text-muted-foreground">Total Photos</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders by job title, ID, or folder name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="folders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="folders">Job Folders</TabsTrigger>
          <TabsTrigger value="photos">All Photos</TabsTrigger>
          <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="folders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFolders.map((folder) => (
              <Card key={folder.jobId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{folder.jobId}</CardTitle>
                      <CardDescription className="text-sm">{folder.jobTitle}</CardDescription>
                    </div>
                    <Badge variant={folder.photoCount > 0 ? "default" : "secondary"}>{folder.photoCount} photos</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      <strong>Folder:</strong> {folder.folderName}
                    </div>

                    {folder.photoCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Last Updated:</strong> {new Date(folder.lastUpdated).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewFolder(folder)}
                        disabled={folder.photoCount === 0}
                        className="flex-1"
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        View Photos
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFolders.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No folders found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "No folders match your search criteria." : "No job folders have been created yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          {selectedFolder ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedFolder.jobId} - Photos</CardTitle>
                    <CardDescription>{selectedFolder.jobTitle}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedFolder(null)}>
                    Back to Folders
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedFolder.photos.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No photos in this folder yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedFolder.photos.map((photo) => (
                      <Card key={photo.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium truncate">{photo.name}</div>

                            {photo.metadata?.caption && (
                              <div className="text-xs text-muted-foreground">
                                <strong>Caption:</strong> {photo.metadata.caption}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(photo.createdTime).toLocaleDateString()}
                            </div>

                            {photo.metadata?.uploadedBy && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {photo.metadata.uploadedBy}
                              </div>
                            )}

                            {photo.metadata?.source && (
                              <Badge variant="outline" className="text-xs">
                                {photo.metadata.source}
                              </Badge>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPhoto(photo)}
                              className="w-full"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              View/Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Folder</h3>
                <p className="text-muted-foreground">Choose a job folder to view its photos.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Photo Uploads</CardTitle>
              <CardDescription>Latest photos uploaded across all jobs</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const allPhotos = jobFolders.flatMap((folder) =>
                  folder.photos.map((photo) => ({ ...photo, jobId: folder.jobId, jobTitle: folder.jobTitle })),
                )
                const recentPhotos = allPhotos
                  .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
                  .slice(0, 10)

                return recentPhotos.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent photos uploaded.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPhotos.map((photo) => (
                      <div key={photo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{photo.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {photo.jobId} - {photo.jobTitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(photo.createdTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {photo.metadata?.source && (
                            <Badge variant="outline" className="text-xs">
                              {photo.metadata.source}
                            </Badge>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDownloadPhoto(photo)}>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
