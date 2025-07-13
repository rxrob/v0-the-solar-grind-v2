"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { SupabaseClient, Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/types"
import supabase from "@/lib/supabaseClient" // CORRECT: Importing the singleton instance
import type { Database } from "@/types/supabase"

type SupabaseContextType = {
  supabase: SupabaseClient<Database>
  session: Session | null
  userProfile: UserProfile | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (_event === "SIGNED_IN" || _event === "SIGNED_OUT") {
        router.refresh()
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    const fetchUserProfile = async (user: User) => {
      try {
        const { data, error, status } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error && status !== 406) {
          console.error("Error fetching user profile:", error.message)
          setUserProfile(null)
          return
        }

        if (data) {
          setUserProfile(data as UserProfile)
        } else {
          setUserProfile(null)
        }
      } catch (e) {
        console.error("An unexpected error occurred while fetching the profile:", e)
        setUserProfile(null)
      }
    }

    if (session?.user) {
      fetchUserProfile(session.user)
    } else {
      setUserProfile(null)
    }
  }, [session])

  const value = {
    supabase,
    session,
    userProfile,
    isLoading,
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
