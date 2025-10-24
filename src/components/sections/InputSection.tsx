import { memo, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { InputSectionProps } from "../../types"
import { MESSAGES } from "../../constants"
import { SectionHeader } from "../SectionHeader"

export const InputSection = memo<InputSectionProps>(({ 
  inputText, 
  isLoading, 
  onInputChange, 
  onSubmit,
  onKeyDown 
}) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="space-y-3 md:space-y-4">
        <SectionHeader
          icon={
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          }
          title="Ввод"
        />

        <div className="space-y-2 md:space-y-3">
          <label htmlFor="input-field" className="text-xs md:text-sm text-gray-300 font-medium block">
            Ваш ввод
          </label>
          <textarea
            id="input-field"
            value={inputText}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder="Введите содержимое..."
            className="w-full h-24 md:h-32 p-2 md:p-3 bg-black/50 border border-gray-600 rounded text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
            disabled={isLoading}
            aria-label="Текстовое поле ввода"
          />
        </div>
      </div>

      <div className="pt-3 lg:hidden">
        <Button
          onClick={onSubmit}
          disabled={isLoading || !inputText.trim()}
          className="w-full h-10 text-sm font-semibold bg-white text-black hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? MESSAGES.LOADING : MESSAGES.RUN}
        </Button>
      </div>

      <div className="pt-3 hidden lg:block">
        <Button
          onClick={onSubmit}
          disabled={isLoading || !inputText.trim()}
          className="w-full h-12 text-sm md:text-base font-semibold bg-white text-black hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? MESSAGES.LOADING : MESSAGES.RUN}
        </Button>
      </div>
    </div>
  )
})

InputSection.displayName = "InputSection"