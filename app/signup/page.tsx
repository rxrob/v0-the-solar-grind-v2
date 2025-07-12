"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg("Success! Please check your email to confirm your account.")
      // Don't redirect immediately, wait for user to confirm email
      // router.push("/dashboard");
    }
    setLoading(false)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md">
        <form onSubmit={handleSignup} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

          {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 text-sm mb-4 text-center">{successMsg}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
