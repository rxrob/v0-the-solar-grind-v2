"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Bold,
  Italic,
  Underline,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sun,
  Moon,
  Monitor,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  Wifi,
  Bluetooth,
  Plane,
  Zap,
  Battery,
  Gauge,
  Bell,
  Save,
  MapPin,
  Activity,
  AlertTriangle,
  FileText,
  Settings,
  Power,
} from "lucide-react"

export default function ToggleGroupDemo() {
  // Text formatting states
  const [textFormatting, setTextFormatting] = useState<string[]>([])
  const [textAlignment, setTextAlignment] = useState("left")
  const [theme, setTheme] = useState("light")

  // Solar system states
  const [solarMonitoring, setSolarMonitoring] = useState<string[]>(["realtime"])
  const [systemStatus, setSystemStatus] = useState("online")

  // Media player states
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioControls, setAudioControls] = useState<string[]>([])
  const [playerControls, setPlayerControls] = useState<string[]>([])

  // System settings states
  const [connectivity, setConnectivity] = useState<string[]>(["wifi"])
  const [powerMode, setPowerMode] = useState("balanced")

  // Individual toggle states
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(true)

  const handleTextFormattingChange = (value: string[]) => {
    setTextFormatting(value)
    toast.success(`Text formatting updated: ${value.join(", ") || "none"}`)
  }

  const handleTextAlignmentChange = (value: string) => {
    setTextAlignment(value)
    toast.success(`Text alignment: ${value}`)
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
    toast.success(`Theme changed to: ${value}`)
  }

  const handleSolarMonitoringChange = (value: string[]) => {
    setSolarMonitoring(value)
    toast.success(`Solar monitoring: ${value.join(", ") || "none"}`)
  }

  const handleSystemStatusChange = (value: string) => {
    setSystemStatus(value)
    toast.success(`System status: ${value}`)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    toast.success(isPlaying ? "Paused" : "Playing")
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    toast.success(isMuted ? "Unmuted" : "Muted")
  }

  const handleAudioControlsChange = (value: string[]) => {
    setAudioControls(value)
    toast.success(`Audio controls: ${value.join(", ") || "none"}`)
  }

  const handlePlayerControlsChange = (value: string[]) => {
    setPlayerControls(value)
    toast.success(`Player controls: ${value.join(", ") || "none"}`)
  }

  const handleConnectivityChange = (value: string[]) => {
    setConnectivity(value)
    toast.success(`Connectivity: ${value.join(", ") || "none"}`)
  }

  const handlePowerModeChange = (value: string) => {
    setPowerMode(value)
    toast.success(`Power mode: ${value}`)
  }

  const resetAllToggles = () => {
    setTextFormatting([])
    setTextAlignment("left")
    setTheme("light")
    setSolarMonitoring(["realtime"])
    setSystemStatus("online")
    setIsPlaying(false)
    setIsMuted(false)
    setAudioControls([])
    setPlayerControls([])
    setConnectivity(["wifi"])
    setPowerMode("balanced")
    setNotifications(true)
    setAutoSave(false)
    setDarkMode(false)
    setWifiEnabled(true)
    setBluetoothEnabled(false)
    setLocationEnabled(true)
    toast.success("All toggles reset to default values")
  }

  const logCurrentState = () => {
    const state = {
      textFormatting,
      textAlignment,
      theme,
      solarMonitoring,
      systemStatus,
      mediaPlayer: { isPlaying, isMuted, audioControls, playerControls },
      system: { connectivity, powerMode },
      individual: { notifications, autoSave, darkMode, wifiEnabled, bluetoothEnabled, locationEnabled },
    }
    console.log("Current Toggle State:", state)
    toast.success("Current state logged to console")
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Toggle Group Demo</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive showcase of toggle groups and individual toggles for Solar Grind V2
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={resetAllToggles} variant="outline">
          Reset All Toggles
        </Button>
        <Button onClick={logCurrentState} variant="outline">
          Log Current State
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Toggle Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Text Formatting</CardTitle>
            <CardDescription>Multiple selection toggle group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup type="multiple" value={textFormatting} onValueChange={handleTextFormattingChange}>
              <ToggleGroupItem value="bold" aria-label="Bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="code" aria-label="Code">
                <Code className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-sm text-muted-foreground">Selected: {textFormatting.join(", ") || "none"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Text Alignment</CardTitle>
            <CardDescription>Single selection toggle group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup type="single" value={textAlignment} onValueChange={handleTextAlignmentChange}>
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="justify" aria-label="Justify">
                <AlignJustify className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-sm text-muted-foreground">Selected: {textAlignment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Selection</CardTitle>
            <CardDescription>Single selection with icons and text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup type="single" value={theme} onValueChange={handleThemeChange}>
              <ToggleGroupItem value="light" aria-label="Light theme">
                <Sun className="h-4 w-4" />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark theme">
                <Moon className="h-4 w-4" />
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" aria-label="System theme">
                <Monitor className="h-4 w-4" />
                System
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-sm text-muted-foreground">Selected: {theme}</p>
          </CardContent>
        </Card>

        {/* Toggle Group Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Toggle Group Variants</CardTitle>
            <CardDescription>Different variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Default Variant</h4>
              <ToggleGroup type="multiple" variant="default">
                <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
                <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
                <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Outline Variant</h4>
              <ToggleGroup type="multiple" variant="outline">
                <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
                <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
                <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Different Sizes</h4>
              <div className="space-y-2">
                <ToggleGroup type="multiple" size="sm">
                  <ToggleGroupItem value="small1">Small</ToggleGroupItem>
                  <ToggleGroupItem value="small2">Small</ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup type="multiple" size="default">
                  <ToggleGroupItem value="default1">Default</ToggleGroupItem>
                  <ToggleGroupItem value="default2">Default</ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup type="multiple" size="lg">
                  <ToggleGroupItem value="large1">Large</ToggleGroupItem>
                  <ToggleGroupItem value="large2">Large</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Solar System Controls */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Solar System Controls</h2>
          <p className="text-muted-foreground">Real-world use cases for Solar Grind V2</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Solar Monitoring Options
              </CardTitle>
              <CardDescription>Configure monitoring and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleGroup type="multiple" value={solarMonitoring} onValueChange={handleSolarMonitoringChange}>
                <ToggleGroupItem value="realtime" aria-label="Real-time data">
                  <Activity className="h-4 w-4" />
                  Real-time Data
                </ToggleGroupItem>
                <ToggleGroupItem value="alerts" aria-label="System alerts">
                  <AlertTriangle className="h-4 w-4" />
                  System Alerts
                </ToggleGroupItem>
                <ToggleGroupItem value="reports" aria-label="Daily reports">
                  <FileText className="h-4 w-4" />
                  Daily Reports
                </ToggleGroupItem>
                <ToggleGroupItem value="maintenance" aria-label="Maintenance mode">
                  <Settings className="h-4 w-4" />
                  Maintenance Mode
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-sm text-muted-foreground">Active monitoring: {solarMonitoring.join(", ") || "none"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>Current system operational status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleGroup type="single" value={systemStatus} onValueChange={handleSystemStatusChange}>
                <ToggleGroupItem value="online" aria-label="System online">
                  <Zap className="h-4 w-4 text-green-500" />
                  Online
                </ToggleGroupItem>
                <ToggleGroupItem value="offline" aria-label="System offline">
                  <Power className="h-4 w-4 text-red-500" />
                  Offline
                </ToggleGroupItem>
                <ToggleGroupItem value="maintenance" aria-label="Maintenance mode">
                  <Settings className="h-4 w-4 text-yellow-500" />
                  Maintenance
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-sm text-muted-foreground">Current status: {systemStatus}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Media Player Controls */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Media Player Controls</h2>
          <p className="text-muted-foreground">Interactive media control examples</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Playback Controls</CardTitle>
              <CardDescription>Individual toggle controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Toggle pressed={isPlaying} onPressedChange={handlePlayPause} aria-label="Play/Pause">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Toggle>
                <Toggle pressed={isMuted} onPressedChange={handleMuteToggle} aria-label="Mute/Unmute">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isMuted ? "Unmuted" : "Muted"}
                </Toggle>
              </div>
              <p className="text-sm text-muted-foreground">
                Status: {isPlaying ? "Playing" : "Paused"}, {isMuted ? "Muted" : "Unmuted"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audio Controls</CardTitle>
              <CardDescription>Multiple selection audio options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleGroup type="multiple" value={audioControls} onValueChange={handleAudioControlsChange}>
                <ToggleGroupItem value="bass" aria-label="Bass boost">
                  <Volume2 className="h-4 w-4" />
                  Bass Boost
                </ToggleGroupItem>
                <ToggleGroupItem value="surround" aria-label="Surround sound">
                  <Volume2 className="h-4 w-4" />
                  Surround
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-sm text-muted-foreground">Audio effects: {audioControls.join(", ") || "none"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Player State</CardTitle>
              <CardDescription>Multiple selection player controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleGroup type="multiple" value={playerControls} onValueChange={handlePlayerControlsChange}>
                <ToggleGroupItem value="shuffle" aria-label="Shuffle">
                  <Shuffle className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="repeat" aria-label="Repeat">
                  <Repeat className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="previous" aria-label="Previous">
                  <SkipBack className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="next" aria-label="Next">
                  <SkipForward className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-sm text-muted-foreground">Active controls: {playerControls.join(", ") || "none"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Connectivity and power management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Connectivity Options</h4>
                <ToggleGroup type="multiple" value={connectivity} onValueChange={handleConnectivityChange}>
                  <ToggleGroupItem value="wifi" aria-label="WiFi">
                    <Wifi className="h-4 w-4" />
                    WiFi
                  </ToggleGroupItem>
                  <ToggleGroupItem value="bluetooth" aria-label="Bluetooth">
                    <Bluetooth className="h-4 w-4" />
                    Bluetooth
                  </ToggleGroupItem>
                  <ToggleGroupItem value="airplane" aria-label="Airplane mode">
                    <Plane className="h-4 w-4" />
                    Airplane
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-sm text-muted-foreground">Connected: {connectivity.join(", ") || "none"}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Power Management</h4>
                <ToggleGroup type="single" value={powerMode} onValueChange={handlePowerModeChange}>
                  <ToggleGroupItem value="performance" aria-label="Performance mode">
                    <Zap className="h-4 w-4" />
                    Performance
                  </ToggleGroupItem>
                  <ToggleGroupItem value="balanced" aria-label="Balanced mode">
                    <Gauge className="h-4 w-4" />
                    Balanced
                  </ToggleGroupItem>
                  <ToggleGroupItem value="saver" aria-label="Power saver mode">
                    <Battery className="h-4 w-4" />
                    Power Saver
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-sm text-muted-foreground">Power mode: {powerMode}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Individual Toggle Components */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Individual Toggle Components</h2>
          <p className="text-muted-foreground">Standalone toggle examples</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Default Toggles</CardTitle>
              <CardDescription>Standard toggle styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Toggle
                  pressed={notifications}
                  onPressedChange={(pressed) => {
                    setNotifications(pressed)
                    toast.success(`Notifications ${pressed ? "enabled" : "disabled"}`)
                  }}
                  aria-label="Toggle notifications"
                >
                  <Bell className="h-4 w-4" />
                </Toggle>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Save</span>
                <Toggle
                  pressed={autoSave}
                  onPressedChange={(pressed) => {
                    setAutoSave(pressed)
                    toast.success(`Auto save ${pressed ? "enabled" : "disabled"}`)
                  }}
                  aria-label="Toggle auto save"
                >
                  <Save className="h-4 w-4" />
                </Toggle>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dark Mode</span>
                <Toggle
                  pressed={darkMode}
                  onPressedChange={(pressed) => {
                    setDarkMode(pressed)
                    toast.success(`Dark mode ${pressed ? "enabled" : "disabled"}`)
                  }}
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Toggle>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outline Toggles</CardTitle>
              <CardDescription>Outline variant styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">WiFi</span>
                <Toggle
                  variant="outline"
                  pressed={wifiEnabled}
                  onPressedChange={(pressed) => {
                    setWifiEnabled(pressed)
                    toast.success(`WiFi ${pressed ? "enabled" : "disabled"}`)
                  }}
                  aria-label="Toggle WiFi"
                >
                  <Wifi className="h-4 w-4" />
                </Toggle>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bluetooth</span>
                <Toggle
                  variant="outline"
                  pressed={bluetoothEnabled}
                  onPressedChange={(pressed) => {
                    setBluetoothEnabled(pressed)
                    toast.success(`Bluetooth ${pressed ? "enabled" : "disabled"}`)
                  }}
                  aria-label="Toggle Bluetooth"
                >
                  <Bluetooth className="h-4 w-4" />
                </Toggle>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Location</span>
                <Toggle
                  variant="outline"
                  pressed={locationEnabled}
                  onPressedChange={(pressed) => {
                    setLocationEnabled(pressed)
                    toast.success(`Location ${pressed ? "enabled" : "disabled"}`)
                  }}
                  aria-label="Toggle location"
                >
                  <MapPin className="h-4 w-4" />
                </Toggle>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Different Sizes</CardTitle>
              <CardDescription>Small, default, and large sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Small</span>
                <Toggle size="sm" aria-label="Small toggle">
                  <Bell className="h-3 w-3" />
                </Toggle>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Default</span>
                <Toggle size="default" aria-label="Default toggle">
                  <Bell className="h-4 w-4" />
                </Toggle>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Large</span>
                <Toggle size="lg" aria-label="Large toggle">
                  <Bell className="h-5 w-5" />
                </Toggle>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
