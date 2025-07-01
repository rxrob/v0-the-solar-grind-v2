"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToastSonner } from "@/hooks/use-toast-sonner"
import { toast } from "sonner"

export default function ToastDemo() {
  const [customMessage, setCustomMessage] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const toastSonner = useToastSonner()

  const simulateAsyncOperation = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve("Operation completed successfully!")
        } else {
          reject(new Error("Operation failed"))
        }
      }, 2000)
    })
  }

  const handlePromiseToast = () => {
    const promise = simulateAsyncOperation()

    toastSonner.promise(promise, {
      loading: "Processing solar calculation...",
      success: "Solar analysis completed!",
      error: "Failed to complete solar analysis",
    })
  }

  const handleCustomToast = () => {
    if (!customMessage.trim()) {
      toastSonner.error("Please enter a message")
      return
    }

    toast(customMessage, {
      description: customDescription || undefined,
      action: {
        label: "Undo",
        onClick: () => toastSonner.info("Action undone"),
      },
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Toast Notifications Demo</h1>
        <p className="text-muted-foreground">Explore different types of toast notifications using Sonner</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Toast Types */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Toast Types</CardTitle>
            <CardDescription>Different types of toast notifications for various scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => toastSonner.success("Success!", "Your solar calculation was saved successfully.")}
              className="w-full"
              variant="default"
            >
              Success Toast
            </Button>

            <Button
              onClick={() => toastSonner.error("Error occurred", "Failed to connect to solar API. Please try again.")}
              className="w-full"
              variant="destructive"
            >
              Error Toast
            </Button>

            <Button
              onClick={() => toastSonner.warning("Warning", "Your API usage is approaching the limit.")}
              className="w-full"
              variant="outline"
            >
              Warning Toast
            </Button>

            <Button
              onClick={() => toastSonner.info("Information", "New solar incentives are available in your area.")}
              className="w-full"
              variant="secondary"
            >
              Info Toast
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Toast Features */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Features</CardTitle>
            <CardDescription>Loading states, promises, and interactive toasts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                const loadingToast = toastSonner.loading("Calculating solar potential...")
                setTimeout(() => {
                  toastSonner.dismiss(loadingToast)
                  toastSonner.success("Calculation complete!", "Your solar system will generate 12,500 kWh annually.")
                }, 3000)
              }}
              className="w-full"
            >
              Loading Toast
            </Button>

            <Button onClick={handlePromiseToast} className="w-full bg-transparent" variant="outline">
              Promise Toast
            </Button>

            <Button
              onClick={() => {
                toast("Solar Report Generated", {
                  description: "Your comprehensive solar analysis is ready.",
                  action: {
                    label: "Download",
                    onClick: () => toastSonner.success("Download started"),
                  },
                })
              }}
              className="w-full"
              variant="secondary"
            >
              Action Toast
            </Button>

            <Button
              onClick={() => {
                toast("Persistent Notification", {
                  description: "This toast will stay until dismissed.",
                  duration: Number.POSITIVE_INFINITY,
                  action: {
                    label: "Dismiss",
                    onClick: () => {},
                  },
                })
              }}
              className="w-full"
              variant="outline"
            >
              Persistent Toast
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Custom Toast Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Toast Builder</CardTitle>
          <CardDescription>Create your own toast notification with custom message and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                placeholder="Enter toast message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Enter description..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleCustomToast} className="w-full">
            Show Custom Toast
          </Button>
        </CardContent>
      </Card>

      {/* Solar-Specific Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Solar Application Examples</CardTitle>
          <CardDescription>Real-world examples of how toasts are used in solar applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              onClick={() => {
                toastSonner.success(
                  "Project Saved",
                  "Solar project 'Residential Install #1234' has been saved to your dashboard.",
                )
              }}
              variant="outline"
            >
              Project Saved
            </Button>

            <Button
              onClick={() => {
                toastSonner.warning(
                  "API Limit Warning",
                  "You have 5 calculations remaining this month. Upgrade to Pro for unlimited access.",
                )
              }}
              variant="outline"
            >
              API Limit Warning
            </Button>

            <Button
              onClick={() => {
                toastSonner.info("Weather Update", "Current conditions may affect solar production estimates.")
              }}
              variant="outline"
            >
              Weather Update
            </Button>

            <Button
              onClick={() => {
                toastSonner.error(
                  "Calculation Error",
                  "Unable to retrieve solar data for this location. Please verify the address.",
                )
              }}
              variant="outline"
            >
              Calculation Error
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
