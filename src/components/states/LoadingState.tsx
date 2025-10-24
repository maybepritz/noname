import { memo } from "react"
import { MESSAGES } from "@/constants"

export const LoadingState = memo(() => (
  <div className="text-center py-6 select-none">
    <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
      <div className="absolute inset-0 rounded-full border-2 border-gray-700/30" />
      
      <div className="absolute inset-0 rounded-full border-2 border-transparent bg-linear-to-tr from-white via-gray-400 to-transparent bg-clip-border animate-spin" 
           style={{ 
             maskImage: "linear-gradient(transparent 50%, black 50%)",
             WebkitMaskImage: "linear-gradient(transparent 50%, black 50%)"
           }} 
      />
      
      <div className="absolute inset-2 rounded-full bg-linear-to-br from-gray-800/50 to-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
      </div>
           
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/60" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/60" />
      </div>
    </div>
    
    <div className="space-y-1">
      <p className="text-sm md:text-base text-gray-300 font-medium">{MESSAGES.GENERATING}</p>
      <div className="flex items-center justify-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
))

LoadingState.displayName = "LoadingState"