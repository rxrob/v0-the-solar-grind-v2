"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sliders, Volume2, FlashlightIcon as Brightness4, Gauge, DollarSign } from "lucide-react"

export default function SliderDemoPage() {
  const [volume, setVolume] = useState([50])
  const [brightness, setBrightness] = useState([75])
  const [temperature, setTemperature] = useState([68])
  const [priceRange, setPriceRange] = useState([100, 500])
  const [systemSize, setSystemSize] = useState([8.5])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sliders className="h-8 w-8" />
          Slider Component Demo
        </h1>
        <p className="text-muted-foreground">Interactive examples of the Slider component in various use cases</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Volume Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Volume Control
            </CardTitle>
            <CardDescription>Single value slider with custom styling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Volume Level</Label>
                <Badge variant="secondary">{volume[0]}%</Badge>
              </div>
              <Slider value={volume} onValueChange={setVolume} max={100} min={0} step={1} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Mute</span>
                <span>Max</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brightness Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brightness4 className="h-5 w-5" />
              Brightness
            </CardTitle>
            <CardDescription>Screen brightness adjustment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Brightness</Label>
                <Badge variant="outline">{brightness[0]}%</Badge>
              </div>
              <Slider value={brightness} onValueChange={setBrightness} max={100} min={10} step={5} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Dim</span>
                <span>Bright</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Temperature
            </CardTitle>
            <CardDescription>Thermostat control with custom range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Target Temperature</Label>
                <Badge variant="default">{temperature[0]}°F</Badge>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={85}
                min={55}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>55°F</span>
                <span>85°F</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Range
            </CardTitle>
            <CardDescription>Dual handle range slider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Price Range</Label>
                <Badge variant="secondary">
                  ${priceRange[0]} - ${priceRange[1]}
                </Badge>
              </div>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                min={0}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$1,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solar System Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Solar System Size
            </CardTitle>
            <CardDescription>Decimal precision slider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>System Size</Label>
                <Badge variant="default">{systemSize[0]} kW</Badge>
              </div>
              <Slider value={systemSize} onValueChange={setSystemSize} max={20} min={2} step={0.1} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>2.0 kW</span>
                <span>20.0 kW</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disabled State */}
        <Card>
          <CardHeader>
            <CardTitle>Disabled Slider</CardTitle>
            <CardDescription>Example of disabled state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Locked Setting</Label>
                <Badge variant="outline">75%</Badge>
              </div>
              <Slider value={[75]} max={100} min={0} step={1} disabled className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Interactive Demo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Solar Calculator</CardTitle>
          <CardDescription>Real-time calculation using multiple sliders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Monthly Electric Bill</Label>
                  <Badge variant="secondary">${Math.round(priceRange[0])}</Badge>
                </div>
                <Slider
                  value={[priceRange[0]]}
                  onValueChange={(value) => setPriceRange([value[0], priceRange[1]])}
                  max={500}
                  min={50}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>System Size (kW)</Label>
                  <Badge variant="secondary">{systemSize[0]} kW</Badge>
                </div>
                <Slider
                  value={systemSize}
                  onValueChange={setSystemSize}
                  max={20}
                  min={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Estimated Annual Savings</div>
                <div className="text-2xl font-bold text-green-700">
                  ${Math.round(systemSize[0] * 1200).toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">System Cost</div>
                <div className="text-2xl font-bold text-blue-700">
                  ${Math.round(systemSize[0] * 3000).toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600 mb-1">Payback Period</div>
                <div className="text-2xl font-bold text-orange-700">
                  {Math.round(((systemSize[0] * 3000 * 0.7) / (systemSize[0] * 1200)) * 10) / 10} years
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg">
            Get Detailed Solar Quote
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
