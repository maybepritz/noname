import { ReactNode, KeyboardEvent } from "react"

export interface Toast {
  message: string
  type: "success" | "error"
}

export interface FoundItem {
  name: string;
  article: string;
  count: string;
  unit_cost: string;
  total_cost: string;
}

export interface ApiResponseData {
  found_items: FoundItem[];
  items_count: number;
  total_cost: string;
  description?: string;
}

export interface LLMResponse {
  id: number;
  complexity: "simple" | "medium" | "complex";
  query: string;
  description: string;
  response: ApiResponseData;
}

export interface ApiResponse {
  response: LLMResponse;
  error?: string;
}

export interface UseToastReturn {
  toast: Toast | null
  showToast: (message: string, type?: Toast["type"]) => void
}

export interface ToastNotificationProps {
  toast: Toast
}

export interface SectionHeaderProps {
  icon: ReactNode
  title: string
}

export interface InputSectionProps {
  inputText: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
}

export interface ResultSectionProps {
  isLoading: boolean
  result: LLMResponse | null
}