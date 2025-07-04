"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

export function SiteNavigation() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              MySolarAI
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/calculator" className="text-sm font-medium hover:text-primary">
                Calculator
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary">
                Pricing
              </Link>
              {user && (
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-muted rounded" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
