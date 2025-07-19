"use client"

import { AdvancedSolarResults } from "@/components/advanced-solar-results"
import { PDFDownloadButton } from "@/components/pdf-download-button"
import { Button } from "@/components/ui/button"
import { useProCalculatorStore } from "@/lib/store"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function Step3Client() {
  const { results, address, customerInfo, back } = useProCalculatorStore()

  if (!results) {
    return (
      <div className="text-center p-8">
        <p>No results to display. Please complete the previous steps.</p>
        <Button onClick={back} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdvancedSolarResults results={results} address={address} />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t bg-background sticky bottom-0">
        <Button variant="outline" onClick={back} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="flex flex-col sm:flex-row gap-4">
          <PDFDownloadButton results={results} address={address} customerInfo={customerInfo} />
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            <a href="https://calendly.com/rob-ionsolar/dallas" target="_blank" rel="noopener noreferrer">
              Schedule Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
