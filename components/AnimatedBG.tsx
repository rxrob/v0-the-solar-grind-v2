"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function AnimatedBG() {
  const { theme } = useTheme()
  // Default to dark to prevent a flash of the light theme on initial load.
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(theme === "dark")
  }, [theme])

  return (
    <div
      className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-neutral-950 dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]"
      style={{
        WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%,#000,transparent)",
        maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%,#000,transparent)",
      }}
    />
  )
}
