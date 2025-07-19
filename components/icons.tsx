import { type LightbulbIcon as LucideProps, Moon, SunMedium, type LucideIcon, Loader2, Chrome } from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  spinner: (props: LucideProps) => <Loader2 {...props} />,
  google: (props: LucideProps) => <Chrome {...props} />,
}
