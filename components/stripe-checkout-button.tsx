"use client"

import type React from "react"
import { useUser } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"
import type { Price, Product } from "@/types"
import { getStripe } from "@/utils/stripe"
import { supabase } from "@/lib/supabase/client"

interface StripeCheckoutButtonProps {
  product: Product
  prices: Price[]
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({ product, prices }) => {
  const { isLoading, user } = useUser()
  const [priceId, setPriceId] = useState<string>("")

  useEffect(() => {
    if (prices.length > 0) {
      setPriceId(prices[0].id)
    }
  }, [prices])

  const handleCheckout = async () => {
    if (!user) {
      // Redirect to sign-in page or show a message
      console.error("User not authenticated")
      return
    }

    if (!priceId) {
      console.error("Price ID not found")
      return
    }

    try {
      const stripe = await getStripe()

      if (!stripe) {
        console.error("Stripe is not initialized")
        return
      }

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { price: priceId, product_id: product.id },
      })

      if (error) {
        console.error("Error creating checkout session:", error)
        return
      }

      if (data?.url) {
        stripe.redirectToCheckout({ sessionId: data.session.id })
      }
    } catch (error) {
      console.error("Error during checkout:", error)
    }
  }

  return (
    <button
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      onClick={handleCheckout}
      disabled={isLoading || !priceId}
    >
      {isLoading ? "Loading..." : "Checkout"}
    </button>
  )
}

export default StripeCheckoutButton
