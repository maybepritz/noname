import { memo } from "react"
import { GrainGradient } from "@paper-design/shaders-react"
import { GRADIENT_CONFIG } from "../constants"

export const BackgroundGradient = memo(() => (
  <div className="fixed inset-0 z-0 select-none">
    <GrainGradient
      {...GRADIENT_CONFIG}
      style={{
        height: "100vh",
        width: "100vw",
      }}
    />
    <div className="absolute inset-0 bg-black opacity-40" aria-hidden="true" />
  </div>
))

BackgroundGradient.displayName = "BackgroundGradient"