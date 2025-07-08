"use client"
import { useState, useEffect } from "react"
import { useProCalculatorStore } from "@/lib/store"
import { EnhancedFileUpload } from "@/components/enhanced-file-upload"

export default function ProCalculatorStep2() {
  const { energyData, setEnergyData } = useProCalculatorStore()
  const [localUsage, setLocalUsage] = useState(energyData.usage || 0)
  const [localBill, setLocalBill] = useState(energyData.bill || 0)
  const [localProvider, setLocalProvider] = useState(energyData.provider || "")

  // Sync local state with store
  useEffect(() => {
    setLocalUsage(energyData.usage || 0)
    setLocalBill(energyData.bill || 0)
    setLocalProvider(energyData.provider || "")
  }, [energyData])

  // Update store when local values change
  const handleUsageChange = (value: number) => {
    setLocalUsage(value)
    setEnergyData({ usage: value })
  }

  const handleBillChange = (value: number) => {
    setLocalBill(value)
    setEnergyData({ bill: value })
  }

  const handleProviderChange = (value: string) => {
    setLocalProvider(value)
    setEnergyData({ provider: value })
  }

  const effectiveRate = localUsage && localBill ? (localBill / localUsage).toFixed(3) : null
  const canContinue = localUsage > 0 && localBill > 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md shadow-md z-50 px-6 py-4 flex justify-between items-center border-b border-orange-500">
        <a href="/" className="text-xl font-bold text-orange-400">
          SolarAI
        </a>
        <nav className="flex gap-6 items-center text-sm font-semibold">
          <a href="/calculator" className="hover:text-orange-400">
            Free Calculator
          </a>
          <a href="/dashboard" className="hover:text-orange-400">
            Dashboard
          </a>
          <a href="/login" className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white transition">
            Sign In / Sign Up
          </a>
        </nav>
      </header>

      <main className="min-h-screen bg-black text-white px-8 py-32">
        {/* Progress Indicator */}
        <div className="mb-8 max-w-4xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="ml-2 text-green-400 font-semibold">Step 1: Address</span>
            </div>
            <div className="flex-1 h-1 bg-gray-700 rounded">
              <div className="h-1 bg-orange-500 rounded w-1/2"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="ml-2 text-orange-400 font-semibold">Step 2: Energy Usage</span>
            </div>
            <div className="flex-1 h-1 bg-gray-700 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-2 text-gray-400 font-semibold">Step 3: Analysis</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-orange-400 mb-6">Step 2: Energy Usage</h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Upload your electric bill for automatic data extraction, or enter your usage details manually to get accurate
          solar savings calculations.
        </p>

        <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Enhanced File Upload */}
          <EnhancedFileUpload />

          {/* Right Column - Manual Input */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">⚡ Energy Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Monthly Usage (kWh) *</label>
                  <input
                    type="number"
                    value={localUsage || ""}
                    onChange={(e) => handleUsageChange(Number(e.target.value))}
                    placeholder="e.g., 1200"
                    className="w-full rounded-md px-4 py-3 text-black text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Find this on your electric bill (usually labeled as kWh used)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Total Monthly Bill ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={localBill || ""}
                    onChange={(e) => handleBillChange(Number(e.target.value))}
                    placeholder="e.g., 150.00"
                    className="w-full rounded-md px-4 py-3 text-black text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Total amount due on your electric bill</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Utility Provider</label>
                  <input
                    type="text"
                    value={localProvider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    placeholder="e.g., Pacific Gas & Electric"
                    className="w-full rounded-md px-4 py-3 text-black text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Your electric company name (optional)</p>
                </div>

                {effectiveRate && (
                  <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-lg">
                    <div className="text-green-300 text-center">
                      <p className="text-sm text-green-400 mb-1">Calculated Rate</p>
                      <p className="text-2xl font-bold">${effectiveRate}/kWh</p>
                      <p className="text-xs text-green-400 mt-1">Based on your usage and bill amount</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sample Bill Info */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">💡 Where to find this info:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>
                  • <strong>kWh Usage:</strong> Usually in a box labeled "Energy Used" or "kWh"
                </li>
                <li>
                  • <strong>Total Bill:</strong> "Amount Due" or "Total Charges"
                </li>
                <li>
                  • <strong>Rate:</strong> May show "Rate per kWh" or we'll calculate it
                </li>
              </ul>
            </div>

            {/* Data Persistence Status */}
            {(localUsage > 0 || localBill > 0 || localProvider) && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center">💾 Data Saved</h4>
                <p className="text-blue-300 text-sm">
                  Your energy data is automatically saved and will be available in the next steps.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center max-w-6xl">
          <a
            href="/pro-calculator"
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            ← Back to Step 1
          </a>

          <a
            href="/pro-calculator/step-3"
            className={`font-semibold py-4 px-8 rounded-lg transition-all duration-200 text-lg shadow-lg ${
              canContinue
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            Continue to Step 3: Analysis →
          </a>
        </div>

        {/* Help Section */}
        {!canContinue && (
          <div className="mt-8 max-w-6xl">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h4 className="text-blue-400 font-semibold mb-3">📋 Need Help?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-300">
                <div>
                  <p className="font-semibold mb-2">Don't have your bill handy?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Check your utility company's website</li>
                    <li>• Look for recent email bills</li>
                    <li>• Use average: 900-1200 kWh/month</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Typical rates by region:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• California: $0.25-0.35/kWh</li>
                    <li>• Texas: $0.12-0.18/kWh</li>
                    <li>• National avg: $0.15-0.20/kWh</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
