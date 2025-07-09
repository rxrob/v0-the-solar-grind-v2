"use client"

import { useAuth } from "@/hooks/use-auth-real"
import { useMapsApi } from "@/app/pro-calculator/layout"

const Step3Page = () => {
  const { user } = useAuth()
  const { isLoaded } = useMapsApi()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Step 3</h1>
      <p>Welcome, {user.email}!</p>
      <p>Maps API Loaded: {isLoaded ? "Yes" : "No"}</p>
    </div>
  )
}

export default Step3Page
