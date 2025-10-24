"use client"

import { memo } from "react"
import { GrainGradient } from "@paper-design/shaders-react"
import { GRADIENT_CONFIG } from "../constants"

export const PageLoader = memo(() => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none">
    {/* Background with gradient */}
    <div className="absolute inset-0">
      <GrainGradient
        {...GRADIENT_CONFIG}
        style={{
          height: "100vh",
          width: "100vw",
        }}
      />
      <div className="absolute inset-0 bg-black opacity-40" />
    </div>

    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <div className="absolute inset-0 rounded-full border-2 border-gray-700/30" />
        
        <div 
          className="absolute inset-0 rounded-full animate-spin"
          style={{ animationDuration: "1.5s" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white/50" />
        </div>
        
        <div className="absolute inset-3 rounded-full bg-linear-to-br from-gray-800/80 to-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/30 animate-pulse" 
               style={{ animationDuration: "2s" }} 
          />
        </div>
        
        <div 
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "3s", animationDirection: "reverse" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80 shadow-lg shadow-white/50" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80 shadow-lg shadow-white/50" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 shadow-lg shadow-white/50" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 shadow-lg shadow-white/50" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
          АвтоТКП
        </h2>
        
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base text-gray-300 font-medium">Загрузка</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>

      <div className="w-48 md:w-64 h-1 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full bg-linear-to-r from-white/60 via-white to-white/60 animate-pulse rounded-full"
          style={{ 
            animation: "progress 2s ease-in-out infinite",
          }}
        />
      </div>
    </div>

    <style jsx>{`
      @keyframes progress {
        0%, 100% {
          transform: translateX(-100%);
          opacity: 0.5;
        }
        50% {
          transform: translateX(100%);
          opacity: 1;
        }
      }
    `}</style>
  </div>
))

PageLoader.displayName = "PageLoader"