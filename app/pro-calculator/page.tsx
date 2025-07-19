import ProCalculatorClient from "./pro-calculator-client"

export default function ProCalculatorPage() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 bg-slate-900">
        <div className="p-8 bg-slate-800 rounded-lg border border-red-500/50">
          <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
          <p>Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</p>
        </div>
      </div>
    )
  }

  return <ProCalculatorClient googleMapsApiKey={googleMapsApiKey} />
}
