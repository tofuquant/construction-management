"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, Calendar, User, MapPin } from "lucide-react"
import type { WorkUpdate } from "@/types/job"

interface PhotoGalleryProps {
  workUpdates: WorkUpdate[]
  jobTitle?: string
}

export function PhotoGallery({ workUpdates, jobTitle }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; update: WorkUpdate } | null>(null)

  const updatesWithPhotos = workUpdates.filter((update) => update.photos.length > 0)

  if (updatesWithPhotos.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Photos Yet</h3>
          <p className="text-slate-600">Photos from work updates will appear here.</p>
        </CardContent>
      </Card>
    )
  }

  const allPhotos = updatesWithPhotos.flatMap((update) => update.photos.map((photo) => ({ url: photo, update })))

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Photo Gallery {jobTitle && `- ${jobTitle}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{allPhotos.length} photos</Badge>
            <Badge variant="secondary">{updatesWithPhotos.length} updates</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPhotos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={`Work photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-medium text-slate-900">Work Update Photo</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{selectedPhoto.update.workerName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(selectedPhoto.update.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = selectedPhoto.url
                    link.download = `work-photo-${Date.now()}.jpg`
                    link.click()
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="max-h-[60vh] overflow-hidden rounded-lg mb-4">
                <img
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt="Work update photo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={`${
                      selectedPhoto.update.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedPhoto.update.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : selectedPhoto.update.status === "blocked"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {selectedPhoto.update.status.replace("-", " ")}
                  </Badge>
                  {selectedPhoto.update.hoursWorked && (
                    <Badge variant="secondary">{selectedPhoto.update.hoursWorked} hours</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-700">{selectedPhoto.update.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
