"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToastSonner } from "@/hooks/use-toast-sonner"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TestTube,
  Calculator,
  Play,
  RotateCcw,
  FileText,
  Zap,
  Home,
  Users,
  Building,
  Shield,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

interface TestCase {
  id: string
  name: string
  description: string
  inputs: Record<string, any>
  expectedValidation: boolean
  expectedCalculations?: Record<string, number>
  category: string
}

interface TestResult {
  testId: string
  passed: boolean
  message: string
  actualValues?: Record<string, any>
  expectedValues?: Record<string, any>
}

const testCases: TestCase[] = [
  // Step 1 Tests - Customer Information
  {
    id: "step1-valid",
    name: "Valid Customer Info",
    description: "All required fields filled correctly",
    inputs: {
      customerName: "John Smith",
      customerEmail: "john@example.com",
      customerPhone: "(555) 123-4567",
      projectName: "Smith Residence Solar",
      customerType: "residential",
    },
    expectedValidation: true,
    category: "step1",
  },
  {
    id: "step1-missing-name",
    name: "Missing Customer Name",
    description: "Required field missing",
    inputs: {
      customerName: "",
      customerEmail: "john@example.com",
      projectName: "Smith Residence Solar",
      customerType: "residential",
    },
    expectedValidation: false,
    category: "step1",
  },
  {
    id: "step1-invalid-email",
    name: "Invalid Email Format",
    description: "Email format validation",
    inputs: {
      customerName: "John Smith",
      customerEmail: "invalid-email",
      projectName: "Smith Residence Solar",
      customerType: "residential",
    },
    expectedValidation: false,
    category: "step1",
  },

  // Step 2 Tests - Property Analysis
  {
    id: "step2-valid",
    name: "Valid Property Info",
    description: "All required property fields",
    inputs: {
      address: "123 Main St, Los Angeles, CA 90210",
      roofType: "asphalt_shingle",
      roofArea: "1500",
      roofOrientation: "south",
      roofTilt: "30",
      shading: "minimal",
      roofCondition: "excellent",
    },
    expectedValidation: true,
    category: "step2",
  },
  {
    id: "step2-missing-address",
    name: "Missing Address",
    description: "Required address field missing",
    inputs: {
      address: "",
      roofType: "asphalt_shingle",
      roofArea: "1500",
    },
    expectedValidation: false,
    category: "step2",
  },
  {
    id: "step2-invalid-roof-area",
    name: "Invalid Roof Area",
    description: "Non-numeric roof area",
    inputs: {
      address: "123 Main St, Los Angeles, CA 90210",
      roofType: "asphalt_shingle",
      roofArea: "invalid",
    },
    expectedValidation: false,
    category: "step2",
  },

  // Step 3 Tests - Energy Profile
  {
    id: "step3-valid",
    name: "Valid Energy Profile",
    description: "Valid monthly bill and rate",
    inputs: {
      monthlyBill: "200",
      electricityRate: "0.28",
      monthlyUsage: "714",
      utilityCompany: "SCE",
      peakUsageHours: "evening",
    },
    expectedValidation: true,
    category: "step3",
  },
  {
    id: "step3-missing-bill",
    name: "Missing Monthly Bill",
    description: "Required bill amount missing",
    inputs: {
      monthlyBill: "",
      electricityRate: "0.28",
    },
    expectedValidation: false,
    category: "step3",
  },
  {
    id: "step3-zero-rate",
    name: "Zero Electricity Rate",
    description: "Invalid zero rate",
    inputs: {
      monthlyBill: "200",
      electricityRate: "0",
    },
    expectedValidation: false,
    category: "step3",
  },

  // Calculation Tests
  {
    id: "calc-basic-residential",
    name: "Basic Residential Calculation",
    description: "Standard residential system sizing",
    inputs: {
      monthlyBill: "200",
      electricityRate: "0.28",
      roofArea: "1500",
      systemGoal: "offset_100",
      panelPreference: "tier1",
      hasEV: false,
      hasPool: false,
      batteryBackup: false,
    },
    expectedValidation: true,
    expectedCalculations: {
      systemSize: 6.1, // Approximately (200/0.28*12*1.2)/1400
      annualProduction: 8845, // systemSize * 1450
      paybackPeriod: 8.5, // Approximate
    },
    category: "calculations",
  },
  {
    id: "calc-with-ev-pool",
    name: "System with EV and Pool",
    description: "Additional load calculations",
    inputs: {
      monthlyBill: "300",
      electricityRate: "0.32",
      roofArea: "2000",
      systemGoal: "offset_100",
      panelPreference: "tier1",
      hasEV: true,
      hasPool: true,
      batteryBackup: false,
    },
    expectedValidation: true,
    expectedCalculations: {
      systemSize: 11.4, // Base + EV (2.5kW) + Pool (1.5kW)
      annualProduction: 16530,
    },
    category: "calculations",
  },
  {
    id: "calc-high-efficiency-battery",
    name: "High Efficiency with Battery",
    description: "Premium system configuration",
    inputs: {
      monthlyBill: "400",
      electricityRate: "0.35",
      roofArea: "2500",
      systemGoal: "offset_120",
      panelPreference: "high_efficiency",
      hasEV: true,
      hasPool: false,
      batteryBackup: true,
      batteryCapacity: "13.5",
    },
    expectedValidation: true,
    expectedCalculations: {
      systemSize: 15.8, // Higher due to 120% offset and EV
      batteryCost: 13500, // 13.5 * 1000
    },
    category: "calculations",
  },

  // Edge Cases
  {
    id: "edge-small-roof",
    name: "Small Roof Constraint",
    description: "Roof area limits system size",
    inputs: {
      monthlyBill: "500",
      electricityRate: "0.30",
      roofArea: "800", // Small roof
      systemGoal: "maximize",
      panelPreference: "tier1",
    },
    expectedValidation: true,
    expectedCalculations: {
      systemSize: 32.0, // Limited by roof: (800*0.7)/17.5
    },
    category: "edge-cases",
  },
  {
    id: "edge-zero-bill",
    name: "Zero Monthly Bill",
    description: "Edge case with no current usage",
    inputs: {
      monthlyBill: "0",
      electricityRate: "0.28",
      roofArea: "1500",
      systemGoal: "maximize",
    },
    expectedValidation: false,
    category: "edge-cases",
  },
]

export default function TestProCalculatorValidationPage() {
  const toast = useToastSonner()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const validateStep = (step: number, formData: Record<string, any>): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.customerName &&
          formData.customerEmail &&
          formData.projectName &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)
        )
      case 2:
        return !!(
          formData.address &&
          formData.roofType &&
          formData.roofArea &&
          !isNaN(Number(formData.roofArea)) &&
          Number(formData.roofArea) > 0
        )
      case 3:
        return !!(
          formData.monthlyBill &&
          formData.electricityRate &&
          !isNaN(Number(formData.monthlyBill)) &&
          !isNaN(Number(formData.electricityRate)) &&
          Number(formData.monthlyBill) > 0 &&
          Number(formData.electricityRate) > 0
        )
      default:
        return true
    }
  }

  const calculateSystem = (inputs: Record<string, any>) => {
    const monthlyBill = Number.parseFloat(inputs.monthlyBill) || 0
    const electricityRate = Number.parseFloat(inputs.electricityRate) || 0.28
    const roofArea = Number.parseFloat(inputs.roofArea) || 1500
    const monthlyUsage = monthlyBill / electricityRate

    // Base system sizing
    let systemSize = Math.round(((monthlyUsage * 12 * 1.2) / 1400) * 10) / 10

    // Roof constraint
    const maxSystemSize = (roofArea * 0.7) / 17.5
    systemSize = Math.min(systemSize, maxSystemSize)

    // Goal adjustments
    if (inputs.systemGoal === "offset_80") systemSize *= 0.8
    if (inputs.systemGoal === "offset_120") systemSize *= 1.2
    if (inputs.systemGoal === "maximize") systemSize = maxSystemSize

    // Additional loads
    if (inputs.hasEV) systemSize += 2.5
    if (inputs.hasPool) systemSize += 1.5
    if (inputs.futureExpansion) systemSize *= 1.15

    const annualProduction = Math.round(systemSize * 1450)

    // Cost calculations
    let costPerWatt = 2.8
    if (inputs.panelPreference === "high_efficiency") costPerWatt = 3.2
    if (inputs.panelPreference === "budget") costPerWatt = 2.4

    const systemCost = Math.round(systemSize * 1000 * costPerWatt)
    const batteryCost = inputs.batteryBackup ? Number.parseFloat(inputs.batteryCapacity || "0") * 1000 : 0
    const totalCost = systemCost + batteryCost

    const federalTaxCredit = totalCost * 0.3
    const netCost = totalCost - federalTaxCredit

    const annualSavings = Math.round(Math.min(annualProduction, monthlyUsage * 12) * electricityRate)
    const paybackPeriod = Math.round((netCost / annualSavings) * 10) / 10

    return {
      systemSize: Math.round(systemSize * 10) / 10,
      annualProduction,
      systemCost: totalCost,
      batteryCost,
      annualSavings,
      paybackPeriod,
      federalTaxCredit,
      netCost,
    }
  }

  const runTest = (testCase: TestCase): TestResult => {
    try {
      // Determine which step this test is for
      let step = 1
      if (testCase.category === "step2") step = 2
      if (testCase.category === "step3") step = 3

      // Test validation
      const validationResult = validateStep(step, testCase.inputs)
      const validationPassed = validationResult === testCase.expectedValidation

      if (!validationPassed) {
        return {
          testId: testCase.id,
          passed: false,
          message: `Validation failed. Expected: ${testCase.expectedValidation}, Got: ${validationResult}`,
        }
      }

      // Test calculations if expected
      if (testCase.expectedCalculations && validationResult) {
        const calculations = calculateSystem(testCase.inputs)
        const calculationErrors: string[] = []

        Object.entries(testCase.expectedCalculations).forEach(([key, expectedValue]) => {
          const actualValue = calculations[key as keyof typeof calculations]
          const tolerance = expectedValue * 0.1 // 10% tolerance

          if (Math.abs(Number(actualValue) - expectedValue) > tolerance) {
            calculationErrors.push(`${key}: expected ~${expectedValue}, got ${actualValue}`)
          }
        })

        if (calculationErrors.length > 0) {
          return {
            testId: testCase.id,
            passed: false,
            message: `Calculation errors: ${calculationErrors.join(", ")}`,
            actualValues: calculations,
            expectedValues: testCase.expectedCalculations,
          }
        }

        return {
          testId: testCase.id,
          passed: true,
          message: "All validations and calculations passed",
          actualValues: calculations,
          expectedValues: testCase.expectedCalculations,
        }
      }

      return {
        testId: testCase.id,
        passed: true,
        message: "Validation passed",
      }
    } catch (error) {
      return {
        testId: testCase.id,
        passed: false,
        message: `Test error: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const filteredTests =
      selectedCategory === "all" ? testCases : testCases.filter((test) => test.category === selectedCategory)

    const results: TestResult[] = []

    for (const testCase of filteredTests) {
      // Simulate async testing
      await new Promise((resolve) => setTimeout(resolve, 100))

      const result = runTest(testCase)
      results.push(result)
      setTestResults([...results])
    }

    setIsRunning(false)

    const passedTests = results.filter((r) => r.passed).length
    const totalTests = results.length

    if (passedTests === totalTests) {
      toast.success("All Tests Passed!", `${passedTests}/${totalTests} tests completed successfully.`)
    } else {
      toast.error("Some Tests Failed", `${passedTests}/${totalTests} tests passed. Check results for details.`)
    }
  }

  const runSingleTest = (testCase: TestCase) => {
    const result = runTest(testCase)
    setTestResults((prev) => {
      const filtered = prev.filter((r) => r.testId !== testCase.id)
      return [...filtered, result]
    })

    if (result.passed) {
      toast.success("Test Passed", `${testCase.name} completed successfully.`)
    } else {
      toast.error("Test Failed", `${testCase.name}: ${result.message}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
    toast.info("Results Cleared", "All test results have been cleared.")
  }

  const getTestResult = (testId: string) => {
    return testResults.find((r) => r.testId === testId)
  }

  const categories = ["all", "step1", "step2", "step3", "calculations", "edge-cases"]
  const categoryIcons = {
    all: TestTube,
    step1: Users,
    step2: Building,
    step3: Zap,
    calculations: Calculator,
    "edge-cases": AlertTriangle,
  }

  const passedCount = testResults.filter((r) => r.passed).length
  const failedCount = testResults.filter((r) => !r.passed).length
  const totalCount = testResults.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/test-pro-calculator">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Test Calculator
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Pro Calculator Validation Tests</span>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Test Suite
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {totalCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {passedCount} Passed
                  </Badge>
                  {failedCount > 0 && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      {failedCount} Failed
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Control Panel */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-blue-600" />
              Test Control Panel
            </CardTitle>
            <CardDescription>
              Run comprehensive tests to validate pro calculator functionality, form validation, and calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Test Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons]
                  const count =
                    category === "all" ? testCases.length : testCases.filter((t) => t.category === category).length
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")} ({count})
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? "Running Tests..." : "Run All Tests"}
              </Button>
              <Button onClick={clearResults} variant="outline" disabled={testResults.length === 0}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
            </div>

            {/* Progress */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Running tests...</span>
                  <span>
                    {testResults.length} /{" "}
                    {selectedCategory === "all"
                      ? testCases.length
                      : testCases.filter((t) => t.category === selectedCategory).length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (testResults.length /
                          (selectedCategory === "all"
                            ? testCases.length
                            : testCases.filter((t) => t.category === selectedCategory).length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Cases and Results */}
        <Tabs defaultValue="test-cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="test-cases" className="space-y-6">
            <div className="grid gap-6">
              {(selectedCategory === "all" ? testCases : testCases.filter((t) => t.category === selectedCategory)).map(
                (testCase) => {
                  const result = getTestResult(testCase.id)
                  const Icon = categoryIcons[testCase.category as keyof typeof categoryIcons]

                  return (
                    <Card key={testCase.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">{testCase.name}</CardTitle>
                              <CardDescription>{testCase.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {testCase.category.replace("-", " ")}
                            </Badge>
                            {result && (
                              <Badge className={result.passed ? "bg-green-500" : "bg-red-500"}>
                                {result.passed ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {result.passed ? "Passed" : "Failed"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Test Inputs */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Test Inputs:</Label>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <pre className="text-xs overflow-x-auto">{JSON.stringify(testCase.inputs, null, 2)}</pre>
                          </div>
                        </div>

                        {/* Expected Results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Expected Validation:</Label>
                            <Badge className={testCase.expectedValidation ? "bg-green-500" : "bg-red-500"}>
                              {testCase.expectedValidation ? "Should Pass" : "Should Fail"}
                            </Badge>
                          </div>
                          {testCase.expectedCalculations && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Expected Calculations:</Label>
                              <div className="bg-blue-50 p-2 rounded text-xs">
                                {Object.entries(testCase.expectedCalculations).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span>{key}:</span>
                                    <span className="font-mono">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Test Result */}
                        {result && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Test Result:</Label>
                            <div
                              className={`p-3 rounded-lg ${result.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                            >
                              <p className={`text-sm ${result.passed ? "text-green-800" : "text-red-800"}`}>
                                {result.message}
                              </p>
                              {result.actualValues && (
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs font-semibold">Actual Values:</Label>
                                    <div className="bg-white p-2 rounded text-xs mt-1">
                                      {Object.entries(result.actualValues).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                          <span>{key}:</span>
                                          <span className="font-mono">
                                            {typeof value === "number" ? value.toFixed(2) : value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {result.expectedValues && (
                                    <div>
                                      <Label className="text-xs font-semibold">Expected Values:</Label>
                                      <div className="bg-white p-2 rounded text-xs mt-1">
                                        {Object.entries(result.expectedValues).map(([key, value]) => (
                                          <div key={key} className="flex justify-between">
                                            <span>{key}:</span>
                                            <span className="font-mono">
                                              {typeof value === "number" ? value.toFixed(2) : value}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Run Single Test Button */}
                        <Button
                          onClick={() => runSingleTest(testCase)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isRunning}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run This Test
                        </Button>
                      </CardContent>
                    </Card>
                  )
                },
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {testResults.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Test Results Yet</h3>
                  <p className="text-gray-500 mb-6">Run some tests to see results here</p>
                  <Button onClick={runAllTests} disabled={isRunning}>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      Test Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{passedCount}</div>
                        <div className="text-sm text-green-700">Tests Passed</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">{failedCount}</div>
                        <div className="text-sm text-red-700">Tests Failed</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round((passedCount / totalCount) * 100)}%
                        </div>
                        <div className="text-sm text-blue-700">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Results */}
                <div className="grid gap-4">
                  {testResults.map((result) => {
                    const testCase = testCases.find((t) => t.id === result.testId)
                    if (!testCase) return null

                    const Icon = categoryIcons[testCase.category as keyof typeof categoryIcons]

                    return (
                      <Card
                        key={result.testId}
                        className={`shadow-lg border-0 bg-white/90 backdrop-blur-sm ${
                          result.passed ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-blue-600" />
                              <div>
                                <h4 className="font-semibold">{testCase.name}</h4>
                                <p className="text-sm text-gray-600">{testCase.description}</p>
                              </div>
                            </div>
                            <Badge className={result.passed ? "bg-green-500" : "bg-red-500"}>
                              {result.passed ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {result.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          <p className={`text-sm ${result.passed ? "text-green-800" : "text-red-800"}`}>
                            {result.message}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
