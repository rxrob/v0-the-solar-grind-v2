"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, UserIcon, LogOut, Sun, Crown } from "lucide-react"

export function SiteNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { supabase, user, profile, loading } = useSupabase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sun className="h-6 w-6 text-yellow-500" />
            <span className="font-bold">The Solar Grind</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link
              href="/pricing"
              className={
                pathname === "/pricing"
                  ? "text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              Pricing
            </Link>
            <Link
              href="/pro-calculator/step-1"
              className={
                pathname.startsWith("/pro-calculator")
                  ? "text-foreground"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              Pro Calculator
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : user && profile ? (
            <>
              {profile.subscription_status !== "active" && profile.subscription_status !== "trialing" && (
                <Button onClick={() => router.push("/pricing")} size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? "User"} />
                      <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/billing")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
