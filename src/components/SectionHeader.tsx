import { memo } from "react"
import { SectionHeaderProps } from "../types"

export const SectionHeader = memo<SectionHeaderProps>(({ icon, title }) => (
  <h3 className="text-sm md:text-lg font-semibold flex items-center gap-2 text-white">
    {icon}
    {title}
  </h3>
))

SectionHeader.displayName = "SectionHeader"