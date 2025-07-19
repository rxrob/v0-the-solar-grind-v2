"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { useAuth } from "@/hooks/use-auth-real"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const { supabase } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}
