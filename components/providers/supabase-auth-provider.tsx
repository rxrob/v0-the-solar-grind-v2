"use client"

import type React from "react"
import type { Session, SupabaseClient } from "@supabase/auth-helpers-nextjs"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"

type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export default function SupabaseAuthProvider({
  children,
  serverSession,
}: {
  children: React.ReactNode
  serverSession: Session | null
}) {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(serverSession)

  // ✅ Fix: Fetch session on initial load
  useEffect(() => {
    // 1. Fetch session once when component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Subscribe to session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // 3. Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return <SupabaseContext.Provider value={{ supabase, session }}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseAuthProvider")
  }
  return context
}
