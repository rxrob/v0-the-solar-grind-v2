"use client"

import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

export default function LogoutButton() {
  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  )
}
