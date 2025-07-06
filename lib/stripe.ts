import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
})

// Helper function to create a customer
export async function createStripeCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })
    return { success: true, customer }
  } catch (error) {
    console.error("Error creating Stripe customer:", error)
    return { success: false, error }
  }
}

// Helper function to create a checkout session
export async function createCheckoutSession({
  customerId,
  customerEmail,
  priceId,
  mode,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId?: string
  customerEmail?: string
  priceId: string
  mode: "payment" | "subscription"
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    }

    if (customerId) {
      sessionParams.customer = customerId
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return { success: true, session }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return { success: false, error }
  }
}

// Helper function to create a billing portal session
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return { success: true, session }
  } catch (error) {
    console.error("Error creating billing portal session:", error)
    return { success: false, error }
  }
}

// Helper function to retrieve a customer
export async function getStripeCustomer(customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return { success: true, customer }
  } catch (error) {
    console.error("Error retrieving Stripe customer:", error)
    return { success: false, error }
  }
}

// Helper function to retrieve a subscription
export async function getStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return { success: true, subscription }
  } catch (error) {
    console.error("Error retrieving Stripe subscription:", error)
    return { success: false, error }
  }
}

// Helper function to cancel a subscription
export async function cancelStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return { success: true, subscription }
  } catch (error) {
    console.error("Error canceling Stripe subscription:", error)
    return { success: false, error }
  }
}

// Helper function to retrieve prices
export async function getStripePrices() {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    })
    return { success: true, prices }
  } catch (error) {
    console.error("Error retrieving Stripe prices:", error)
    return { success: false, error }
  }
}

// Helper function to retrieve a specific price
export async function getStripePrice(priceId: string) {
  try {
    const price = await stripe.prices.retrieve(priceId)
    return { success: true, price }
  } catch (error) {
    console.error("Error retrieving Stripe price:", error)
    return { success: false, error }
  }
}

// Helper function to construct webhook events
export function constructWebhookEvent(body: string, signature: string, secret: string) {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret)
    return { success: true, event }
  } catch (error) {
    console.error("Error constructing webhook event:", error)
    return { success: false, error }
  }
}

// Helper function to test Stripe connection
export async function testStripeConnection() {
  try {
    const account = await stripe.accounts.retrieve()
    return {
      success: true,
      account: {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency,
        email: account.email,
      },
    }
  } catch (error) {
    console.error("Error testing Stripe connection:", error)
    return { success: false, error }
  }
}
