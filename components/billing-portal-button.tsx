"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "react-hot-toast"

import { supabase } from "@/lib/supabase/client"

const BillingPortalButton = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("No user signed in")
      }

      const { data, error } = await supabase.functions.invoke("create-manage-link", {
        body: {
          customer: session?.user?.id,
        },
      })

      if (error) {
        throw error
      }

      window.location.href = data.url
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className="bg-brand-500 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-500 disabled:cursor-not-allowed"
      onClick={handleManageSubscription}
      disabled={loading}
    >
      {loading ? "Loading..." : "Manage Subscription"}
    </button>
  )
}

export default BillingPortalButton
