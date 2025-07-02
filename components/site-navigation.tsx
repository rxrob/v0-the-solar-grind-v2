"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sun, Calculator, DollarSign, BarChart3, User, Settings, LogOut, Menu, Crown, FileText } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSubscription } from "@/hooks/use-subscription"

export function SiteNavigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { subscription, isProUser } = useSubscription(user?.email || null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Calculator", href: "/calculator", icon: Calculator },
    { name: "Pricing", href: "/pricing", icon: DollarSign },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, requiresAuth: true },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

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
              {navigation.map((item) => {
                if (item.requiresAuth && !user) return null
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Subscription Badge */}
            {user && isProUser && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/reports">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Reports</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-4">
                    {navigation.map((item) => {
                      if (item.requiresAuth && !user) return null
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? "bg-blue-100 text-blue-900"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}

                    {!user && (
                      <>
                        <div className="border-t pt-4">
                          <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/signup"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md mt-2"
                          >
                            Get started
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
