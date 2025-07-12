"use client"

import Step3Client from "./step-3-client"

const Step3Page = () => {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const solarApiKey = process.env.NEXT_PUBLIC_SOLAR_API_KEY

  if (!mapsApiKey || !solarApiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-2xl font-bold text-red-500">Configuration Error</h1>
        <p className="text-gray-300">A required API key is missing. Please check your environment variables.</p>
      </div>
    )
  }

  return <Step3Client mapsApiKey={mapsApiKey} solarApiKey={solarApiKey} />
}

export default Step3Page
