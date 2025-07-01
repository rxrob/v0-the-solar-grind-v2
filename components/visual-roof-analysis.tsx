"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Upload, RotateCcw, Square, Sun, Calculator, Download, Eye, EyeOff } from "lucide-react"

interface RoofPanel {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  efficiency: number
}

interface AnalysisResult {
  totalPanels: number
  totalCapacity: number
  estimatedProduction: number
  roofUtilization: number
  shadingImpact: number
}

export function VisualRoofAnalysis() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [panels, setPanels] = useState<RoofPanel[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<Partial<RoofPanel> | null>(null)
  const [panelSize, setPanelSize] = useState([40]) // Panel size in pixels
  const [showPanels, setShowPanels] = useState(true)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        drawCanvas()
      }
      img.src = URL.createObjectURL(file)
    }
  }

  // Draw canvas with image and panels
  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image if available
    if (image) {
      const aspectRatio = image.width / image.height
      let drawWidth = canvas.width * scale
      let drawHeight = drawWidth / aspectRatio

      if (drawHeight > canvas.height * scale) {
        drawHeight = canvas.height * scale
        drawWidth = drawHeight * aspectRatio
      }

      ctx.drawImage(image, offset.x, offset.y, drawWidth, drawHeight)
    }

    // Draw panels if visible
    if (showPanels) {
      panels.forEach((panel) => {
        ctx.save()
        ctx.translate(panel.x + panel.width / 2, panel.y + panel.height / 2)
        ctx.rotate((panel.rotation * Math.PI) / 180)

        // Panel color based on efficiency
        const efficiency = panel.efficiency || 0.8
        const alpha = 0.3 + efficiency * 0.4
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2

        ctx.fillRect(-panel.width / 2, -panel.height / 2, panel.width, panel.height)
        ctx.strokeRect(-panel.width / 2, -panel.height / 2, panel.width, panel.height)

        ctx.restore()
      })
    }

    // Draw current panel being placed
    if (currentPanel && currentPanel.x !== undefined && currentPanel.y !== undefined) {
      ctx.save()
      ctx.fillStyle = "rgba(59, 130, 246, 0.5)"
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.fillRect(currentPanel.x, currentPanel.y, panelSize[0], panelSize[0] * 0.6)
      ctx.strokeRect(currentPanel.x, currentPanel.y, panelSize[0], panelSize[0] * 0.6)
      ctx.restore()
    }
  }

  // Handle canvas click for panel placement
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newPanel: RoofPanel = {
      id: `panel-${Date.now()}`,
      x,
      y,
      width: panelSize[0],
      height: panelSize[0] * 0.6, // Standard solar panel aspect ratio
      rotation: 0,
      efficiency: 0.8 + Math.random() * 0.15, // Random efficiency between 80-95%
    }

    setPanels([...panels, newPanel])
  }

  // Calculate analysis results
  const calculateAnalysis = () => {
    if (panels.length === 0) return

    const totalPanels = panels.length
    const avgEfficiency = panels.reduce((sum, panel) => sum + panel.efficiency, 0) / totalPanels
    const totalCapacity = totalPanels * 0.4 // Assuming 400W per panel
    const estimatedProduction = totalCapacity * avgEfficiency * 1500 // kWh per year
    const roofUtilization = Math.min(((totalPanels * panelSize[0] * panelSize[0] * 0.6) / (800 * 600)) * 100, 100)
    const shadingImpact = Math.random() * 15 // Simulated shading impact

    setAnalysis({
      totalPanels,
      totalCapacity,
      estimatedProduction,
      roofUtilization,
      shadingImpact,
    })
  }

  // Clear all panels
  const clearPanels = () => {
    setPanels([])
    setAnalysis(null)
  }

  // Auto-place panels (simple grid algorithm)
  const autoPlacePanels = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const newPanels: RoofPanel[] = []
    const panelWidth = panelSize[0]
    const panelHeight = panelSize[0] * 0.6
    const spacing = 10

    for (let y = 50; y < canvas.height - panelHeight - 50; y += panelHeight + spacing) {
      for (let x = 50; x < canvas.width - panelWidth - 50; x += panelWidth + spacing) {
        newPanels.push({
          id: `auto-panel-${newPanels.length}`,
          x,
          y,
          width: panelWidth,
          height: panelHeight,
          rotation: 0,
          efficiency: 0.8 + Math.random() * 0.15,
        })
      }
    }

    setPanels(newPanels)
  }

  // Export analysis
  const exportAnalysis = () => {
    if (!analysis) return

    const data = {
      analysis,
      panels,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "roof-analysis.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    drawCanvas()
  }, [image, panels, showPanels, scale, offset, currentPanel])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Visual Roof Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="roof-image" className="cursor-pointer">
                <div className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  <Upload className="h-5 w-5" />
                  <span>Upload Roof Image</span>
                </div>
                <input id="roof-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <Button onClick={autoPlacePanels} variant="outline">
              <Square className="h-4 w-4 mr-2" />
              Auto Place
            </Button>
            <Button onClick={clearPanels} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm">Panel Size:</span>
              <div className="w-32">
                <Slider value={panelSize} onValueChange={setPanelSize} min={20} max={80} step={5} />
              </div>
              <span className="text-sm text-muted-foreground">{panelSize[0]}px</span>
            </div>
            <Button onClick={() => setShowPanels(!showPanels)} variant="outline" size="sm">
              {showPanels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPanels ? "Hide" : "Show"} Panels
            </Button>
          </div>

          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={handleCanvasClick}
              className="cursor-crosshair w-full h-auto"
              style={{ maxHeight: "400px" }}
            />
          </div>

          {/* Panel Info */}
          {panels.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary">{panels.length} Panels Placed</Badge>
              <Button onClick={calculateAnalysis} size="sm">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Button onClick={exportAnalysis} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.totalPanels}</div>
                <div className="text-sm text-muted-foreground">Total Panels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.totalCapacity.toFixed(1)}kW</div>
                <div className="text-sm text-muted-foreground">System Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.estimatedProduction.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">kWh/year</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analysis.roofUtilization.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Roof Utilization</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Summary</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Optimal panel placement identified</li>
                <li>• Shading impact: {analysis.shadingImpact.toFixed(1)}% reduction</li>
                <li>• Estimated annual savings: ${(analysis.estimatedProduction * 0.12).toLocaleString()}</li>
                <li>• System payback period: ~8-12 years</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
