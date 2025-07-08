"use client"

import { useRef, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    google: any
  }
}

export default function ProCalculatorStep1() {
  const [address, setAddress] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const autocompleteRef = useRef<HTMLInputElement>(null)

  // Initialize Google Autocomplete after the script loads
  const handleScriptLoad = () => {
    if (!window.google?.maps?.places) return

    setIsGoogleLoaded(true)

    const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current!, {
      types: ["address"],
      componentRestrictions: { country: "us" },
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      if (!place.geometry || !place.geometry.location) return

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      setAddress(place.formatted_address || "")
      setCoordinates({ lat, lng })
    })
  }

  return (
    <>
      {/* Load Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={() => console.error("❌ Failed to load Google Maps script")}
      />

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
            <a href="/auth" className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white transition">
              Sign In / Sign Up
            </a>
          </nav>
        </header>

        <main className="min-h-screen bg-black text-white px-8 py-32">
          {/* Progress Indicator */}
          <div className="mb-8 max-w-4xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 text-orange-400 font-semibold">Step 1: Address</span>
              </div>
              <div className="flex-1 h-1 bg-gray-700 rounded"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2 text-gray-400 font-semibold">Step 2: Energy Usage</span>
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

          <h1 className="text-4xl font-bold text-orange-400 mb-6">Step 1: Find Your Home</h1>
          <p className="text-gray-300 mb-8 max-w-xl">
            Enter your address below to preview your home's sunlight potential.
          </p>

          {/* Debug Info */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg max-w-xl">
            <p className="text-sm text-gray-400 mb-2">🔍 System Status:</p>
            <div className="space-y-1 text-sm">
              <p className={`${window.google ? "text-green-400" : "text-red-400"}`}>
                Google Maps: {window.google ? "✅ Loaded" : "❌ Not Loaded"}
              </p>
              <p className={`${window.google?.maps?.places ? "text-green-400" : "text-red-400"}`}>
                Places API: {window.google?.maps?.places ? "✅ Available" : "❌ Not Available"}
              </p>
              <p className={`${isGoogleLoaded ? "text-green-400" : "text-yellow-400"}`}>
                Autocomplete: {isGoogleLoaded ? "✅ Ready" : "⏳ Initializing..."}
              </p>
              <p className={`${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "text-green-400" : "text-red-400"}`}>
                API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "✅ Configured" : "❌ Missing"}
              </p>
            </div>
          </div>

          {/* Address Input */}
          <div className="mb-8">
            <input
              ref={autocompleteRef}
              type="text"
              placeholder={isGoogleLoaded ? "Start typing your address..." : "Loading autocomplete..."}
              className={`w-full max-w-xl px-4 py-3 rounded-md text-black text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                !isGoogleLoaded ? "bg-gray-300 cursor-not-allowed" : "bg-white"
              }`}
              disabled={!isGoogleLoaded}
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            />
            {!isGoogleLoaded && (
              <p className="text-yellow-400 text-sm mt-2">
                ⏳ Please wait while we load the address autocomplete system...
              </p>
            )}
          </div>

          {/* Results */}
          {coordinates && (
            <div className="space-y-6 max-w-4xl">
              <h2 className="text-2xl font-semibold text-white">Your Home Views</h2>
              <p className="text-green-400 mb-4">✅ Address found: {address}</p>
              <p className="text-gray-400 text-sm mb-6">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>

              {/* Map Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Front View - positioned to face the house from the street */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-300 mb-3 font-semibold flex items-center">🏠 Front View</p>
                  <img
                    src={`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coordinates.lat - 0.00005},${coordinates.lng}&heading=0&pitch=0&fov=90&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Front View"
                    className="rounded-lg shadow-md w-full"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFN0cmVldCBWaWV3IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
                    }}
                  />
                </div>

                {/* Right Side View - smaller offset and specific heading */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-300 mb-3 font-semibold flex items-center">➡️ Right Side View</p>
                  <img
                    src={`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coordinates.lat},${coordinates.lng + 0.00008}&heading=270&pitch=0&fov=90&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Right Side View"
                    className="rounded-lg shadow-md w-full"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFN0cmVldCBWaWV3IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
                    }}
                  />
                </div>

                {/* Left Side View - smaller offset and specific heading */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-300 mb-3 font-semibold flex items-center">⬅️ Left Side View</p>
                  <img
                    src={`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coordinates.lat},${coordinates.lng - 0.00008}&heading=90&pitch=0&fov=90&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Left Side View"
                    className="rounded-lg shadow-md w-full"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFN0cmVldCBWaWV3IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
                    }}
                  />
                </div>

                {/* Aerial View - optimal zoom for full roof view */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-300 mb-3 font-semibold flex items-center">🛰️ Aerial Roof View</p>
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=21&size=600x300&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Aerial Roof View"
                    className="rounded-lg shadow-md w-full"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFNhdGVsbGl0ZSBWaWV3IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4="
                    }}
                  />
                </div>
              </div>

              {/* Continue */}
              <div className="mt-8">
                <a
                  href="/pro-calculator/step-2"
                  className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 text-lg shadow-lg"
                >
                  Continue to Step 2: Energy Usage →
                </a>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!coordinates && isGoogleLoaded && (
            <div className="mt-8 max-w-xl">
              <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2 font-bold">1.</span>
                  Start typing your address in the field above
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2 font-bold">2.</span>
                  Select your address from the dropdown suggestions
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2 font-bold">3.</span>
                  View your home from multiple angles to assess solar potential
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2 font-bold">4.</span>
                  Continue to the next step for detailed analysis
                </li>
              </ul>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
