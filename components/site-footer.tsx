import { Sun } from "lucide-react"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/10">
      <div className="container mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-4 py-8 px-4 md:flex-row md:px-6">
        <div className="flex items-center space-x-2">
          <Sun className="h-6 w-6 text-orange-400" />
          <span className="font-bold">The Solar Grind</span>
        </div>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} The Solar Grind. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <Link href="/privacy" className="text-sm text-slate-400 hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-slate-400 hover:text-white">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  )
}
