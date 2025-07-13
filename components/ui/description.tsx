import * as React from "react"

import { cn } from "@/lib/utils"

const Description = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  },
)
Description.displayName = "Description"

export { Description }
