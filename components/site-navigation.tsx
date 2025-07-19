"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth-real"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Sun } from "lucide-react"

const navLinks = [
  { href: "/pro-calculator", label: "Pro Calculator" },
  { href: "/dashboard", label: "Dashboard" },
]

export function SiteNavigation() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sun className="h-6 w-6 text-orange-400" />
            <span className="hidden font-bold sm:inline-block">The Solar Grind</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === link.href ? "text-foreground" : "text-foreground/60",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link href="/" className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Sun className="h-6 w-6 text-orange-400" />
                  <span>The Solar Grind</span>
                </Link>
                <div className="flex h-full flex-col">
                  <nav className="grid flex-1 gap-6 text-lg font-medium">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "transition-colors hover:text-foreground",
                          pathname === link.href ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto">
                    {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : user ? (
                      <LogoutButton />
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button asChild className="w-full">
                          <Link href="/login">Log In</Link>
                        </Button>
                        <Button variant="secondary" asChild className="w-full">
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-2 md:flex">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : user ? (
                <LogoutButton />
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </nav>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
