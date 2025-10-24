import { memo } from "react"
import { cn } from "@/lib/utils"
import { ToastNotificationProps } from "../types"

export const ToastNotification = memo<ToastNotificationProps>(({ toast }) => {
  const isSuccess = toast.type === "success"
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300 select-none">
      <div
        className={cn(
          "bg-black/90 backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-sm",
          isSuccess ? "border-green-500/50 text-green-100" : "border-red-500/50 text-red-100"
        )}
      >
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <svg
              className="w-5 h-5 text-green-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-red-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      </div>
    </div>
  )
})

ToastNotification.displayName = "ToastNotification"