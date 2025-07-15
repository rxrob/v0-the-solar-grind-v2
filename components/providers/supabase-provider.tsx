"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"
import type { SupabaseClient } from "@supabase/supabase-js"

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient()

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }

  return context
}
