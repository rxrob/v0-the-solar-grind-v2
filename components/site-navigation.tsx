"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuthReal } from "@/hooks/use-auth-real"
import {
  Sun,
  Menu,
  Calculator,
  Crown,
  FileText,
  BarChart3,
  Eye,
  DollarSign,
  User,
  LogOut,
  Settings,
} from "lucide-react"

const navigation = [
  { name: "Home", href: "/", icon: Sun },
  { name: "Basic Calculator", href: "/basic-calculator", icon: Calculator },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
]

const proNavigation = [
  { name: "Pro Calculator", href: "/pro-calculator", icon: Crown, pro: true },
  { name: "Visual Analysis", href: "/visual-analysis", icon: Eye, pro: true },
  { name: "Reports", href: "/reports", icon: FileText, pro: true },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, pro: true },
]

export function SiteNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, signOut, isPro } = useAuthReal()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href) ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            } ${mobile ? "w-full" : ""}`}
            onClick={() => mobile && setIsOpen(false)}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}

      {user && (
        <>
          <div className={`border-t pt-4 mt-4 ${mobile ? "" : "hidden"}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pro Features</p>
          </div>
          {proNavigation.map((item) => {
            const Icon = item.icon
            const canAccess = isPro || !item.pro
            return (
              <Link
                key={item.name}
                href={canAccess ? item.href : "/pricing"}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href) && canAccess
                    ? "bg-blue-100 text-blue-900"
                    : canAccess
                      ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      : "text-gray-400 cursor-not-allowed"
                } ${mobile ? "w-full" : ""}`}
                onClick={() => mobile && setIsOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
                {item.pro && (
                  <Badge variant={isPro ? "default" : "secondary"} className="ml-auto text-xs">
                    {isPro ? "Pro" : "Upgrade"}
                  </Badge>
                )}
              </Link>
            )
          })}
        </>
      )}
    </>
  )

  return (
    <nav className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Sun className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Solar Grind</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavItems />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {isPro && (
                  <Badge variant="default" className="hidden sm:flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Pro
                  </Badge>
                )}
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavItems mobile />

                  <div className="border-t pt-4 mt-4">
                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">{profile?.email || user.email}</span>
                          {isPro && (
                            <Badge variant="default" className="ml-auto">
                              Pro
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" className="w-full justify-start" asChild>
                          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Dashboard
                          </Link>
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            Sign in
                          </Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link href="/signup" onClick={() => setIsOpen(false)}>
                            Get started
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
