"use client"

import { useState, useCallback, KeyboardEvent } from "react"
import { useToast } from "@/hooks/useToast"
import { ToastNotification } from "@/components/ToastNotification"
import { InputSection } from "@/components/sections/InputSection"
import { ResultSection } from "@/components/sections/ResultSection"
import { ApiResponse, LLMResponse } from "@/types"
import { API_ENDPOINT, MESSAGES } from "@/constants"

export default function Page() {
  const { toast, showToast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputText, setInputText] = useState<string>("")
  const [result, setResult] = useState<LLMResponse | null>(null)

  const handleAction = useCallback(async (): Promise<void> => {
    if (!inputText.trim()) {
      showToast(MESSAGES.EMPTY_INPUT, "error")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputText,
        }),
      })

      const data: ApiResponse = await response.json()

      if (!response.ok) {
        // Обработка случая когда товары не найдены (404)
        if (response.status === 404) {
          showToast(data.error || "Товары не найдены. Попробуйте уточнить запрос.", "error")
          return
        }
        throw new Error(data.error || MESSAGES.ERROR)
      }

      console.log("✅ Полученные данные:", data)
      setResult(data.response)
      showToast(MESSAGES.SUCCESS, "success")
    } catch (error) {
      console.error("❌ Ошибка:", error)
      const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR
      showToast(errorMessage, "error")
    } finally {
      setIsLoading(false)
    }
  }, [inputText, showToast])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleAction()
      }
    },
    [handleAction]
  )

  return (
    <div className="bg-background min-h-screen flex items-center justify-center select-none">
      {toast && <ToastNotification toast={toast} />}
      
      <div className="relative z-10 p-2 md:p-6 w-full max-w-6xl mx-auto select-none overflow-auto">
        <div className="bg-black/70 backdrop-blur-sm border-0 p-3 md:p-8 rounded-xl">
          <header className="mb-4 md:mb-8">
            <h1 className="text-lg md:text-2xl font-bold text-white select-none">
              АвтоТКП
            </h1>
          </header>

          <main className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-12">
            <InputSection
              inputText={inputText}
              isLoading={isLoading}
              onInputChange={setInputText}
              onSubmit={handleAction}
              onKeyDown={handleKeyDown}
            />
            
            <ResultSection
              isLoading={isLoading}
              result={result}
            />
          </main>

          <footer className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-gray-600/50 select-none">
            <div className="flex items-center justify-center">
              <span className="text-xs md:text-sm text-gray-400">
                Сделано командой "Без названия"
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}