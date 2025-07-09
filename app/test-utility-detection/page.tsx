"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  MapPin,
  FileText,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Target,
  TrendingUp,
  Building2,
} from "lucide-react"

import {
  detectUtilityFromAddress,
  detectUtilityFromOCR,
  combineDetectionResults,
  getSolarProgram,
  getAllUtilities,
  getUtilitiesByType,
  type UtilityDetectionResult,
} from "@/lib/utility-detection-real"

interface TestResult {
  address: string
  expectedUtility?: string
  result: UtilityDetectionResult
  isCorrect?: boolean
  timestamp: number
}

interface BatchTestCase {
  address: string
  expectedUtility: string
  zipCode: string
  city: string
}

const BATCH_TEST_CASES: BatchTestCase[] = [
  {
    address: "123 Main St, McKinney, TX 75070",
    expectedUtility: "GRAYSON-COLLIN ELECTRIC COOPERATIVE INC",
    zipCode: "75070",
    city: "McKinney",
  },
  {
    address: "456 Oak Ave, Allen, TX 75013",
    expectedUtility: "GRAYSON-COLLIN ELECTRIC COOPERATIVE INC",
    zipCode: "75013",
    city: "Allen",
  },
  {
    address: "789 Pine St, Kyle, TX 78640",
    expectedUtility: "BLUEBONNET ELECTRIC COOPERATIVE INC",
    zipCode: "78640",
    city: "Kyle",
  },
  {
    address: "321 Elm Dr, Houston, TX 77001",
    expectedUtility: "CenterPoint Energy",
    zipCode: "77001",
    city: "Houston",
  },
  {
    address: "654 Cedar Ln, Dallas, TX 75201",
    expectedUtility: "Oncor Electric Delivery",
    zipCode: "75201",
    city: "Dallas",
  },
  {
    address: "987 Maple St, New Braunfels, TX 78130",
    expectedUtility: "GUADALUPE VALLEY ELECTRIC COOPERATIVE INC",
    zipCode: "78130",
    city: "New Braunfels",
  },
]

const OCR_TEST_SAMPLES = [
  {
    name: "Grayson-Collin Bill",
    text: "GRAYSON-COLLIN ELECTRIC COOPERATIVE INC\nAccount Number: 123456789\nService Address: 123 Main St, McKinney TX 75070\nkWh Used: 1,250\nAmount Due: $221.45\nRate: $0.1772/kWh",
  },
  {
    name: "Bluebonnet Bill",
    text: "BLUEBONNET ELECTRIC COOPERATIVE\nMember Account: 987654321\nService Location: 456 Oak St, Kyle TX 78640\nEnergy Usage: 980 kWh\nTotal Amount: $156.80\nEnergy Charge: $0.0616/kWh",
  },
  {
    name: "CenterPoint Bill",
    text: "CenterPoint Energy\nAccount: 555666777\nService Address: 789 Pine St, Houston TX 77001\nElectricity Usage: 1,450 kWh\nTotal Bill: $289.50\nDelivery Charges Apply",
  },
  {
    name: "Oncor Bill",
    text: "Oncor Electric Delivery\nTDU Account: 111222333\nService Point: 321 Elm Dr, Dallas TX 75201\nkWh Delivered: 1,100\nDelivery Charges: $45.60\nChoose your REP for energy rates",
  },
]

export default function TestUtilityDetection() {
  const [singleAddress, setSingleAddress] = useState("")
  const [ocrText, setOcrText] = useState("")
  const [selectedOcrSample, setSelectedOcrSample] = useState("")

  const [singleResult, setSingleResult] = useState<TestResult | null>(null)
  const [ocrResult, setOcrResult] = useState<UtilityDetectionResult | null>(null)
  const [combinedResult, setCombinedResult] = useState<UtilityDetectionResult | null>(null)

  const [batchResults, setBatchResults] = useState<TestResult[]>([])
  const [batchProgress, setBatchProgress] = useState(0)
  const [isRunningBatch, setIsRunningBatch] = useState(false)

  const [performanceMetrics, setPerformanceMetrics] = useState<{
    totalTests: number
    correctDetections: number
    averageTime: number
    confidenceDistribution: { high: number; medium: number; low: number }
  } | null>(null)

  const allUtilities = getAllUtilities()
  const { cooperatives, tdus, municipals } = getUtilitiesByType()

  const handleSingleTest = () => {
    if (!singleAddress.trim()) return

    const startTime = performance.now()
    const result = detectUtilityFromAddress(singleAddress)
    const endTime = performance.now()

    const testResult: TestResult = {
      address: singleAddress,
      result,
      timestamp: Date.now(),
    }

    setSingleResult(testResult)
    console.log(`🔍 Single test completed in ${(endTime - startTime).toFixed(2)}ms:`, result)
  }

  const handleOcrTest = () => {
    if (!ocrText.trim()) return

    const startTime = performance.now()
    const result = detectUtilityFromOCR(ocrText)
    const endTime = performance.now()

    setOcrResult(result)
    console.log(`📄 OCR test completed in ${(endTime - startTime).toFixed(2)}ms:`, result)

    // If we have a single address result, combine them
    if (singleResult) {
      const combined = combineDetectionResults(singleResult.result, result)
      setCombinedResult(combined)
      console.log("🔗 Combined result:", combined)
    }
  }

  const handleBatchTest = async () => {
    setIsRunningBatch(true)
    setBatchResults([])
    setBatchProgress(0)

    const results: TestResult[] = []
    const startTime = performance.now()

    for (let i = 0; i < BATCH_TEST_CASES.length; i++) {
      const testCase = BATCH_TEST_CASES[i]

      const testStartTime = performance.now()
      const result = detectUtilityFromAddress(testCase.address)
      const testEndTime = performance.now()

      const isCorrect = result.detectedUtility === testCase.expectedUtility

      const testResult: TestResult = {
        address: testCase.address,
        expectedUtility: testCase.expectedUtility,
        result,
        isCorrect,
        timestamp: Date.now(),
      }

      results.push(testResult)
      setBatchResults([...results])
      setBatchProgress(((i + 1) / BATCH_TEST_CASES.length) * 100)

      console.log(
        `📊 Batch test ${i + 1}/${BATCH_TEST_CASES.length} (${(testEndTime - testStartTime).toFixed(2)}ms):`,
        {
          address: testCase.address,
          expected: testCase.expectedUtility,
          detected: result.detectedUtility,
          correct: isCorrect,
          confidence: result.confidence,
        },
      )

      // Small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const endTime = performance.now()
    const totalTime = endTime - startTime
    const correctCount = results.filter((r) => r.isCorrect).length

    const confidenceDistribution = results.reduce(
      (acc, r) => {
        acc[r.result.confidence]++
        return acc
      },
      { high: 0, medium: 0, low: 0 },
    )

    setPerformanceMetrics({
      totalTests: results.length,
      correctDetections: correctCount,
      averageTime: totalTime / results.length,
      confidenceDistribution,
    })

    setIsRunningBatch(false)
    console.log(
      `✅ Batch testing completed: ${correctCount}/${results.length} correct (${((correctCount / results.length) * 100).toFixed(1)}%)`,
    )
  }

  const loadOcrSample = (sampleText: string) => {
    setOcrText(sampleText)
    setSelectedOcrSample(sampleText)
  }

  const renderDetectionResult = (result: UtilityDetectionResult, title: string) => (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="h-5 w-5 text-blue-400" />
          {title}
          <Badge
            className={
              result.confidence === "high"
                ? "bg-green-600 hover:bg-green-700"
                : result.confidence === "medium"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-red-600 hover:bg-red-700"
            }
          >
            {result.confidence} confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.detectedUtility ? (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <h4 className="font-semibold text-green-400">Detected Utility</h4>
            </div>
            <p className="text-lg font-medium text-white">{result.detectedUtility}</p>
            <p className="text-sm text-gray-400">Detection method: {result.method}</p>

            {getSolarProgram(result.detectedUtility) && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                <h5 className="font-medium text-white mb-2">Solar Program Details:</h5>
                {(() => {
                  const program = getSolarProgram(result.detectedUtility!)!
                  return (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Net Metering:</span>
                        <p className={program.netMetering ? "text-green-400" : "text-yellow-400"}>
                          {program.netMetering ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Buyback Rate:</span>
                        <p className="text-blue-400">
                          {typeof program.buybackRate === "number"
                            ? `$${program.buybackRate.toFixed(4)}/kWh`
                            : program.buybackRate}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Monthly Fee:</span>
                        <p className="text-orange-400">{program.dgFee > 0 ? `$${program.dgFee}` : "No fee"}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <h4 className="font-semibold text-yellow-400">No Utility Detected</h4>
            </div>
            <p className="text-gray-300">Could not automatically detect utility provider.</p>
          </div>
        )}

        {result.alternatives.length > 0 && (
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Suggested Alternatives:</h4>
            <div className="flex flex-wrap gap-2">
              {result.alternatives.map((utility) => (
                <Badge key={utility} variant="outline" className="border-blue-500 text-blue-400">
                  {utility}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {result.warnings.length > 0 && (
          <Alert className="border-yellow-600 bg-yellow-900/20">
            <Info className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              <ul className="list-disc list-inside space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-4">Utility Detection Test Suite</h1>
          <p className="text-gray-300 max-w-3xl">
            Comprehensive testing tool for the Texas utility detection system. Test address parsing, OCR extraction, and
            combined detection methods with real solar program data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <Building2 className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Total Utilities</h3>
              <p className="text-3xl font-bold text-blue-400">{allUtilities.length}</p>
              <p className="text-sm text-gray-400">Texas utilities supported</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Cooperatives</h3>
              <p className="text-3xl font-bold text-green-400">{cooperatives.length}</p>
              <p className="text-sm text-gray-400">Electric cooperatives</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-orange-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">TDUs</h3>
              <p className="text-3xl font-bold text-orange-400">{tdus.length}</p>
              <p className="text-sm text-gray-400">Transmission utilities</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Single Test
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Batch Test
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              OCR Test
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5 text-orange-400" />
                  Single Address Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="singleAddress" className="text-white">
                    Enter Texas Address
                  </Label>
                  <Input
                    id="singleAddress"
                    placeholder="e.g., 123 Main St, McKinney, TX 75070"
                    value={singleAddress}
                    onChange={(e) => setSingleAddress(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleSingleTest}
                  disabled={!singleAddress.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Test Address Detection
                </Button>
              </CardContent>
            </Card>

            {singleResult && renderDetectionResult(singleResult.result, "Address Detection Result")}
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-orange-400" />
                  Batch Testing
                  {isRunningBatch && <Badge className="bg-blue-600 hover:bg-blue-700">Running...</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Test {BATCH_TEST_CASES.length} predefined addresses with known expected utilities.
                </p>

                {isRunningBatch && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{Math.round(batchProgress)}%</span>
                    </div>
                    <Progress value={batchProgress} className="bg-gray-700" />
                  </div>
                )}

                <Button
                  onClick={handleBatchTest}
                  disabled={isRunningBatch}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Target className="mr-2 h-4 w-4" />
                  {isRunningBatch ? "Running Tests..." : "Run Batch Tests"}
                </Button>
              </CardContent>
            </Card>

            {batchResults.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Batch Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {batchResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.isCorrect ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{result.address}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                result.result.confidence === "high"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : result.result.confidence === "medium"
                                    ? "bg-yellow-600 hover:bg-yellow-700"
                                    : "bg-red-600 hover:bg-red-700"
                              }
                            >
                              {result.result.confidence}
                            </Badge>
                            {result.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Expected:</span>
                            <p className="text-white">{result.expectedUtility}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Detected:</span>
                            <p className={result.isCorrect ? "text-green-400" : "text-red-400"}>
                              {result.result.detectedUtility || "None"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ocr" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-orange-400" />
                  OCR Text Testing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Sample Bills</Label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {OCR_TEST_SAMPLES.map((sample) => (
                      <Button
                        key={sample.name}
                        variant="outline"
                        size="sm"
                        onClick={() => loadOcrSample(sample.text)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        {sample.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ocrText" className="text-white">
                    Utility Bill Text
                  </Label>
                  <Textarea
                    id="ocrText"
                    placeholder="Paste utility bill text here..."
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={handleOcrTest}
                  disabled={!ocrText.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Test OCR Detection
                </Button>
              </CardContent>
            </Card>

            {ocrResult && renderDetectionResult(ocrResult, "OCR Detection Result")}
            {combinedResult && renderDetectionResult(combinedResult, "Combined Detection Result")}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {performanceMetrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <Target className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-2">Accuracy</h3>
                    <p className="text-3xl font-bold text-green-400">
                      {((performanceMetrics.correctDetections / performanceMetrics.totalTests) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-400">
                      {performanceMetrics.correctDetections}/{performanceMetrics.totalTests} correct
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-2">Avg Time</h3>
                    <p className="text-3xl font-bold text-blue-400">{performanceMetrics.averageTime.toFixed(1)}ms</p>
                    <p className="text-sm text-gray-400">per detection</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-2">High Confidence</h3>
                    <p className="text-3xl font-bold text-green-400">
                      {performanceMetrics.confidenceDistribution.high}
                    </p>
                    <p className="text-sm text-gray-400">detections</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-2">Medium/Low</h3>
                    <p className="text-3xl font-bold text-yellow-400">
                      {performanceMetrics.confidenceDistribution.medium + performanceMetrics.confidenceDistribution.low}
                    </p>
                    <p className="text-sm text-gray-400">detections</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Performance Data</h3>
                  <p className="text-gray-400 mb-4">Run batch tests to see performance metrics</p>
                  <Button onClick={handleBatchTest} className="bg-orange-500 hover:bg-orange-600">
                    Run Performance Test
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
