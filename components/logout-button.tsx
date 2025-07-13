"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabaseClient" // CORRECT: Importing the singleton instance
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
      <LogOut className="h-5 w-5" />
    </Button>
  )
}
