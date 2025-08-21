"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, FolderOpen, CheckCircle } from "lucide-react"

export function WhatsAppIntegration() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  const handleWebhookSetup = async () => {
    // This would typically verify the webhook configuration
    console.log("[v0] Setting up WhatsApp webhook:", webhookUrl)
    setIsConfigured(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Integration
          </CardTitle>
          <CardDescription>Enable job creation and photo uploads via WhatsApp messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isConfigured ? "default" : "secondary"}>
              {isConfigured ? "Configured" : "Not Configured"}
            </Badge>
            {isConfigured && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Webhook URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://your-domain.com/api/whatsapp/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button onClick={handleWebhookSetup}>Setup</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            Google Drive Integration
          </CardTitle>
          <CardDescription>Automatic photo organization by job ID and name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="default">Active</Badge>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>

            <div className="text-sm text-muted-foreground">
              Photos uploaded via WhatsApp are automatically organized into folders named:
              <code className="bg-muted px-1 rounded">JobID-JobName</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Commands</CardTitle>
          <CardDescription>Available commands for workers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Create Job:</strong>
              <code className="block bg-muted p-2 rounded mt-1">
                create job Foundation Work at 123 Main St priority high
              </code>
            </div>

            <div>
              <strong>Update Job:</strong>
              <code className="block bg-muted p-2 rounded mt-1">update job J001 status in-progress hours 4</code>
            </div>

            <div>
              <strong>Upload Photos:</strong>
              <div className="bg-muted p-2 rounded mt-1">Send images with captions to document work progress</div>
            </div>

            <div>
              <strong>Get Help:</strong>
              <code className="block bg-muted p-2 rounded mt-1">help</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
