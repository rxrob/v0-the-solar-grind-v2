"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sun, Menu } from "lucide-react"

export function SiteNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Sun className="h-6 w-6 text-yellow-500" />
          <span className="text-xl font-bold text-white">The Solar Grind</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors duration-200">
            Pricing
          </Link>
          <Link href="/pro-calculator" className="text-slate-300 hover:text-white transition-colors duration-200">
            Pro Calculator
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Button
            onClick={() => router.push("/login")}
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Log In
          </Button>
          <Button
            onClick={() => router.push("/signup")}
            className="bg-white hover:bg-gray-100 text-slate-900 font-medium"
          >
            Sign Up
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
            <Sun className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-slate-300">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-slate-900 border-slate-800">
            <div className="flex flex-col space-y-4 mt-8">
              <Link
                href="/pricing"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white transition-colors duration-200 p-3 rounded-lg hover:bg-slate-800"
              >
                Pricing
              </Link>
              <Link
                href="/pro-calculator"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white transition-colors duration-200 p-3 rounded-lg hover:bg-slate-800"
              >
                Pro Calculator
              </Link>
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <Button
                  onClick={() => {
                    router.push("/login")
                    setIsOpen(false)
                  }}
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => {
                    router.push("/signup")
                    setIsOpen(false)
                  }}
                  className="w-full bg-white hover:bg-gray-100 text-slate-900 font-medium"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
