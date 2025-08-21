"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, X, ImageIcon, FileImage, Download, Eye, Tag, Calendar } from "lucide-react"

interface PhotoData {
  file: File
  url: string
  caption?: string
  tags: string[]
  timestamp: string
  id: string
}

interface PhotoUploadProps {
  onPhotosChange: (photos: PhotoData[]) => void
  maxPhotos?: number
  existingPhotos?: string[]
  jobId?: string
}

const PHOTO_STORAGE_KEY = "construction_photos"

export function PhotoUpload({ onPhotosChange, maxPhotos = 10, existingPhotos = [], jobId }: PhotoUploadProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoData[]>([])
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<PhotoData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (jobId) {
      const savedPhotos = localStorage.getItem(`${PHOTO_STORAGE_KEY}_${jobId}`)
      if (savedPhotos) {
        try {
          const parsedPhotos = JSON.parse(savedPhotos)
          setSelectedPhotos(parsedPhotos)
          onPhotosChange(parsedPhotos)
        } catch (error) {
          console.error("Failed to load saved photos:", error)
        }
      }
    }
  }, [jobId, onPhotosChange])

  useEffect(() => {
    if (jobId && selectedPhotos.length > 0) {
      localStorage.setItem(`${PHOTO_STORAGE_KEY}_${jobId}`, JSON.stringify(selectedPhotos))
    }
  }, [selectedPhotos, jobId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/")
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })

    if (selectedPhotos.length + validFiles.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    const newPhotos = validFiles.map(
      (file): PhotoData => ({
        file,
        url: URL.createObjectURL(file),
        caption: "",
        tags: [],
        timestamp: new Date().toISOString(),
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }),
    )

    const updatedPhotos = [...selectedPhotos, ...newPhotos]
    setSelectedPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  const removePhoto = (id: string) => {
    const photoToRemove = selectedPhotos.find((p) => p.id === id)
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.url)
    }

    const newPhotos = selectedPhotos.filter((p) => p.id !== id)
    setSelectedPhotos(newPhotos)
    onPhotosChange(newPhotos)
  }

  const updateCaption = (id: string, caption: string) => {
    const updatedPhotos = selectedPhotos.map((photo) => (photo.id === id ? { ...photo, caption } : photo))
    setSelectedPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
    setEditingCaption(null)
  }

  const addTag = (id: string, tag: string) => {
    if (!tag.trim()) return

    const updatedPhotos = selectedPhotos.map((photo) =>
      photo.id === id
        ? {
            ...photo,
            tags: [...photo.tags, tag.trim()].filter((t, i, arr) => arr.indexOf(t) === i),
          }
        : photo,
    )
    setSelectedPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
    setNewTag("")
  }

  const removeTag = (photoId: string, tagToRemove: string) => {
    const updatedPhotos = selectedPhotos.map((photo) =>
      photo.id === photoId
        ? {
            ...photo,
            tags: photo.tags.filter((tag) => tag !== tagToRemove),
          }
        : photo,
    )
    setSelectedPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  const downloadPhoto = (photo: PhotoData) => {
    const link = document.createElement("a")
    link.href = photo.url
    link.download = `construction_photo_${photo.timestamp.split("T")[0]}_${photo.id}.${photo.file.name.split(".").pop()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-700">
          Upload Photos ({selectedPhotos.length}/{maxPhotos})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={selectedPhotos.length >= maxPhotos}
        >
          <Camera className="w-4 h-4 mr-2" />
          Add Photos
        </Button>
      </div>

      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />

      {/* Upload Area */}
      {selectedPhotos.length === 0 && (
        <Card
          className="border-2 border-dashed border-slate-300 hover:border-orange-400 transition-colors cursor-pointer"
          onClick={triggerFileInput}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-sm font-medium text-slate-600 mb-2">Click to upload photos</p>
            <p className="text-xs text-slate-500 text-center">
              Support JPG, PNG, GIF up to 10MB each
              <br />
              Maximum {maxPhotos} photos
            </p>
          </CardContent>
        </Card>
      )}

      {/* Photo Previews with Enhanced Management */}
      {selectedPhotos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative group">
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.caption || `Photo ${photo.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Photo Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setSelectedPhotoForView(photo)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => downloadPhoto(photo)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* File Size and Date */}
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {(photo.file.size / 1024 / 1024).toFixed(1)}MB
                  </Badge>
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(photo.timestamp).toLocaleDateString()}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Caption */}
                <div>
                  <Label className="text-xs font-medium text-slate-600">Caption</Label>
                  {editingCaption === photo.id ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Add a caption..."
                        defaultValue={photo.caption}
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateCaption(photo.id, e.currentTarget.value)
                          } else if (e.key === "Escape") {
                            setEditingCaption(null)
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector("input")
                          if (input) updateCaption(photo.id, input.value)
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <p
                      className="text-sm text-slate-700 mt-1 cursor-pointer hover:bg-slate-50 p-1 rounded min-h-[24px]"
                      onClick={() => setEditingCaption(photo.id)}
                    >
                      {photo.caption || "Click to add caption..."}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-xs font-medium text-slate-600">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1 mb-2">
                    {photo.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                        <button onClick={() => removeTag(photo.id, tag)} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addTag(photo.id, newTag)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addTag(photo.id, newTag)}
                      disabled={!newTag.trim()}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add More Button */}
          {selectedPhotos.length < maxPhotos && (
            <Card
              className="border-2 border-dashed border-slate-300 hover:border-orange-400 transition-colors cursor-pointer flex items-center justify-center min-h-[300px]"
              onClick={triggerFileInput}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Add More Photos</p>
                <p className="text-xs text-slate-500">Click to upload</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Previously Uploaded</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingPhotos.map((url, index) => (
              <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPhotos.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileImage className="w-4 h-4" />
          <span>
            {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? "s" : ""} selected (
            {(selectedPhotos.reduce((total, photo) => total + photo.file.size, 0) / 1024 / 1024).toFixed(1)}MB total)
          </span>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhotoForView && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Photo Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPhotoForView(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <img
                src={selectedPhotoForView.url || "/placeholder.svg"}
                alt={selectedPhotoForView.caption || "Photo"}
                className="w-full max-h-96 object-contain mb-4"
              />
              <div className="space-y-2">
                <p>
                  <strong>Caption:</strong> {selectedPhotoForView.caption || "No caption"}
                </p>
                <p>
                  <strong>Tags:</strong> {selectedPhotoForView.tags.join(", ") || "No tags"}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(selectedPhotoForView.timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>Size:</strong> {(selectedPhotoForView.file.size / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
