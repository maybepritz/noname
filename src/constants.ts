export const TOAST_DURATION = 3000
export const API_ENDPOINT = "/api/llm"

export const MESSAGES = {
  EMPTY_INPUT: "Пожалуйста, введите текст",
  SUCCESS: "Запрос выполнен успешно!",
  ERROR: "Произошла ошибка",
  LOADING: "Выполнение...",
  READY: "Готово к генерации",
  GENERATING: "Генерация...",
  RUN: "Запустить",
  DOWNLOAD: "Скачать",
} as const

export const GRADIENT_CONFIG = {
  colors: ["#404040", "#808080", "#595959", "#2b2b2b"],
  colorBack: "#000000",
  softness: 0.5,
  intensity: 0.5,
  noise: 0.25,
  shape: "corners" as const,
  speed: 1,
}