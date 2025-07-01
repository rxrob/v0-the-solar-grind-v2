"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  ToggleLeft,
  Wifi,
  Bluetooth,
  Volume2,
  Bell,
  Moon,
  Sun,
  Shield,
  Zap,
  Car,
  Waves,
  Home,
  Settings,
  Eye,
} from "lucide-react"

export default function SwitchDemoPage() {
  // Basic switches
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(false)
  const [sound, setSound] = useState(true)

  // Solar system switches
  const [solarEnabled, setSolarEnabled] = useState(true)
  const [batteryBackup, setBatteryBackup] = useState(false)
  const [gridTie, setGridTie] = useState(true)
  const [monitoring, setMonitoring] = useState(true)

  // Home automation switches
  const [smartLights, setSmartLights] = useState(false)
  const [securitySystem, setSecuritySystem] = useState(true)
  const [climateControl, setClimateControl] = useState(false)
  const [poolHeater, setPoolHeater] = useState(false)
  const [evCharging, setEvCharging] = useState(false)

  // Privacy switches
  const [dataCollection, setDataCollection] = useState(false)
  const [locationTracking, setLocationTracking] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  // Disabled switches
  const [premiumFeature, setPremiumFeature] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(true)

  const handleSolarToggle = (enabled: boolean) => {
    setSolarEnabled(enabled)
    if (enabled) {
      toast.success("Solar System Activated", "Your solar panels are now generating clean energy!")
    } else {
      toast.warning("Solar System Deactivated", "Solar energy generation has been paused.")
    }
  }

  const handleBatteryToggle = (enabled: boolean) => {
    setBatteryBackup(enabled)
    if (enabled) {
      toast.success("Battery Backup Enabled", "Your home now has backup power protection.")
    } else {
      toast.info("Battery Backup Disabled", "Backup power protection is now off.")
    }
  }

  const saveSettings = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve("Settings saved successfully!"), 1500)
      }),
      {
        loading: "Saving your preferences...",
        success: "All settings have been saved!",
        error: "Failed to save settings. Please try again.",
      },
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <ToggleLeft className="h-8 w-8" />
          Switch Component Demo
        </h1>
        <p className="text-muted-foreground">Interactive examples of the Switch component in various use cases</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>Basic device and system preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <Label htmlFor="darkmode">Dark Mode</Label>
              </div>
              <Switch id="darkmode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <Label htmlFor="wifi">Wi-Fi</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="wifi" checked={wifi} onCheckedChange={setWifi} />
                <Badge variant={wifi ? "default" : "secondary"}>{wifi ? "Connected" : "Disconnected"}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4" />
                <Label htmlFor="bluetooth">Bluetooth</Label>
              </div>
              <Switch id="bluetooth" checked={bluetooth} onCheckedChange={setBluetooth} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Label htmlFor="sound">System Sounds</Label>
              </div>
              <Switch id="sound" checked={sound} onCheckedChange={setSound} />
            </div>
          </CardContent>
        </Card>

        {/* Solar System Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Solar System
            </CardTitle>
            <CardDescription>Control your solar energy system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="solar">Solar Generation</Label>
                <p className="text-xs text-muted-foreground">Enable/disable solar panels</p>
              </div>
              <Switch id="solar" checked={solarEnabled} onCheckedChange={handleSolarToggle} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="battery">Battery Backup</Label>
                <p className="text-xs text-muted-foreground">Store excess energy</p>
              </div>
              <Switch id="battery" checked={batteryBackup} onCheckedChange={handleBatteryToggle} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="grid">Grid Connection</Label>
                <p className="text-xs text-muted-foreground">Sell excess power</p>
              </div>
              <Switch id="grid" checked={gridTie} onCheckedChange={setGridTie} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monitoring">System Monitoring</Label>
                <p className="text-xs text-muted-foreground">Real-time performance</p>
              </div>
              <Switch id="monitoring" checked={monitoring} onCheckedChange={setMonitoring} />
            </div>

            {solarEnabled && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">System Active</div>
                <div className="text-xs text-green-600">
                  Generating {batteryBackup ? "and storing " : ""}clean energy
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Home Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Home Automation
            </CardTitle>
            <CardDescription>Smart home device controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Label htmlFor="lights">Smart Lights</Label>
              </div>
              <Switch id="lights" checked={smartLights} onCheckedChange={setSmartLights} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <Label htmlFor="security">Security System</Label>
              </div>
              <Switch id="security" checked={securitySystem} onCheckedChange={setSecuritySystem} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Label htmlFor="climate">Climate Control</Label>
              </div>
              <Switch id="climate" checked={climateControl} onCheckedChange={setClimateControl} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4" />
                <Label htmlFor="pool">Pool Heater</Label>
              </div>
              <Switch id="pool" checked={poolHeater} onCheckedChange={setPoolHeater} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <Label htmlFor="ev">EV Charging</Label>
              </div>
              <Switch id="ev" checked={evCharging} onCheckedChange={setEvCharging} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Control your data and privacy preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data">Data Collection</Label>
                <p className="text-xs text-muted-foreground">Allow usage analytics</p>
              </div>
              <Switch id="data" checked={dataCollection} onCheckedChange={setDataCollection} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="location">Location Tracking</Label>
                <p className="text-xs text-muted-foreground">Share location data</p>
              </div>
              <Switch id="location" checked={locationTracking} onCheckedChange={setLocationTracking} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Performance Analytics</Label>
                <p className="text-xs text-muted-foreground">System optimization</p>
              </div>
              <Switch id="analytics" checked={analytics} onCheckedChange={setAnalytics} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing">Marketing Communications</Label>
                <p className="text-xs text-muted-foreground">Promotional emails</p>
              </div>
              <Switch id="marketing" checked={marketing} onCheckedChange={setMarketing} />
            </div>

            {!dataCollection && !locationTracking && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Privacy Mode Active</div>
                <div className="text-xs text-blue-600">Minimal data collection enabled</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disabled States */}
        <Card>
          <CardHeader>
            <CardTitle>Disabled States</CardTitle>
            <CardDescription>Examples of disabled switches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between opacity-50">
              <div className="space-y-0.5">
                <Label htmlFor="premium">Premium Features</Label>
                <p className="text-xs text-muted-foreground">Upgrade required</p>
              </div>
              <Switch id="premium" checked={premiumFeature} onCheckedChange={setPremiumFeature} disabled />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">System locked</p>
              </div>
              <Switch id="maintenance" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} disabled />
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Disabled Controls</div>
              <div className="text-xs text-gray-500">These settings require special permissions</div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Styled Switches */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Styling</CardTitle>
            <CardDescription>Switches with custom colors and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="success">Success Style</Label>
              <Switch id="success" checked={true} className="data-[state=checked]:bg-green-500" />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="warning">Warning Style</Label>
              <Switch id="warning" checked={true} className="data-[state=checked]:bg-yellow-500" />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="danger">Danger Style</Label>
              <Switch id="danger" checked={true} className="data-[state=checked]:bg-red-500" />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="large">Large Switch</Label>
              <Switch id="large" checked={true} className="h-8 w-14 data-[state=checked]:bg-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Summary</CardTitle>
          <CardDescription>Overview of your current preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-medium">System</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Notifications:</span>
                  <Badge variant={notifications ? "default" : "secondary"}>{notifications ? "On" : "Off"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Dark Mode:</span>
                  <Badge variant={darkMode ? "default" : "secondary"}>{darkMode ? "On" : "Off"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Wi-Fi:</span>
                  <Badge variant={wifi ? "default" : "secondary"}>{wifi ? "Connected" : "Off"}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Solar System</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Generation:</span>
                  <Badge variant={solarEnabled ? "default" : "secondary"}>{solarEnabled ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Battery:</span>
                  <Badge variant={batteryBackup ? "default" : "secondary"}>
                    {batteryBackup ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Grid Tie:</span>
                  <Badge variant={gridTie ? "default" : "secondary"}>{gridTie ? "Connected" : "Isolated"}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Home Automation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Smart Lights:</span>
                  <Badge variant={smartLights ? "default" : "secondary"}>{smartLights ? "On" : "Off"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Security:</span>
                  <Badge variant={securitySystem ? "default" : "secondary"}>
                    {securitySystem ? "Armed" : "Disarmed"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>EV Charging:</span>
                  <Badge variant={evCharging ? "default" : "secondary"}>{evCharging ? "Active" : "Inactive"}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Privacy</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Data Collection:</span>
                  <Badge variant={dataCollection ? "destructive" : "default"}>
                    {dataCollection ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <Badge variant={locationTracking ? "destructive" : "default"}>
                    {locationTracking ? "Tracked" : "Private"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Analytics:</span>
                  <Badge variant={analytics ? "secondary" : "default"}>{analytics ? "On" : "Off"}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button onClick={saveSettings} className="flex-1">
              Save All Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Reset to defaults
                setNotifications(true)
                setDarkMode(false)
                setWifi(true)
                setBluetooth(false)
                setSolarEnabled(true)
                setBatteryBackup(false)
                setDataCollection(false)
                toast.success("Settings Reset", "All preferences have been reset to defaults.")
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
