import type React from "react"

export default function ProCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}
