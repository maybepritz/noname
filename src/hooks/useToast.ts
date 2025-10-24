import { useState, useCallback } from "react";
import { Toast, UseToastReturn } from "../types";
import { TOAST_DURATION } from "../constants";

export const useToast = (): UseToastReturn => {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), TOAST_DURATION)
  }, [])

  return { toast, showToast }
}