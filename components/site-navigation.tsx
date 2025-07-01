"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Sun, Calculator, BarChart3, FileText, User, Menu, X, Crown, Zap, Home, LogOut } from "lucide-react"

export function SiteNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Basic Calculator", href: "/basic-calculator", icon: Calculator },
    { name: "Pro Calculator", href: "/pro-calculator", icon: Zap, pro: true },
    { name: "Visual Analysis", href: "/visual-analysis", icon: BarChart3, pro: true },
    { name: "Reports", href: "/reports", icon: FileText, pro: true },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-blue-500 rounded-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent">
                MySolarAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-amber-100 to-blue-100 text-amber-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {item.pro && (
                  <Badge className="ml-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    {user.subscription_tier === "pro" ? "Pro" : "Demo"}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-600 hover:text-gray-900">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-blue-500 text-white">Demo Mode</Badge>
                <Button asChild size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-amber-100 to-blue-100 text-amber-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.pro && (
                    <Badge className="ml-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">Pro</Badge>
                  )}
                </Link>
              ))}

              {/* Mobile User Info */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{user.email}</span>
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                        {user.subscription_tier === "pro" ? "Pro" : "Demo"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={signOut}
                      className="w-full justify-start text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="px-3">
                    <Badge className="bg-gradient-to-r from-amber-500 to-blue-500 text-white mb-2">Demo Mode</Badge>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
