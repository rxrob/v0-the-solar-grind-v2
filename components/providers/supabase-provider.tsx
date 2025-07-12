"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { UserProfile } from "@/types"

type SupabaseContextType = {
  supabase: SupabaseClient
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error, status } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error && status !== 406) {
          console.error("Error fetching profile:", error.message)
          setProfile(null)
          return
        }
        setProfile(data as UserProfile | null)
      } catch (error) {
        console.error("An unexpected error occurred fetching profile:", error)
        setProfile(null)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const value = {
    supabase,
    user,
    profile,
    loading,
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
