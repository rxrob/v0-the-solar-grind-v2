"use client"

import type { ReactNode } from "react"
import { useState, useEffect, useMemo } from "react"
import { createContext, useContext } from "react"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-client"

interface SupabaseContextType {
  session: Session | null
  user: User | null
  loading: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  session: null,
  user: null,
  loading: true,
})

export const useSupabase = () => {
  return useContext(SupabaseContext)
}

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!active) return

        if (error) {
          console.error("Initial session error:", error)
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }

        // Only set session if it's valid and has a user
        const validSession = data.session && data.session.user
        setSession(validSession ? data.session : null)
        setUser(validSession ? data.session.user : null)
        setLoading(false)
      } catch (error) {
        console.error("Error loading session:", error)
        if (active) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email || "no user")

      // Only set session if it's valid and has a user
      const validSession = newSession && newSession.user
      setSession(validSession ? newSession : null)
      setUser(validSession ? newSession.user : null)

      // Set loading to false after any auth state change
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
    }),
    [session, user, loading],
  )

  return (
    <SupabaseContext.Provider value={value}>
      <SessionContextProvider supabaseClient={supabase} initialSession={session}>
        {children}
      </SessionContextProvider>
    </SupabaseContext.Provider>
  )
}
