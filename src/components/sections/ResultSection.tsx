"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { ResultSectionProps } from "@/types";
import { MESSAGES } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import {
  Download,
  Package,
  RussianRuble,
  FileText,
  Maximize,
  X,
} from "lucide-react";
import { LLMResponse } from "@/types";

function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function lockBodyScroll() {
  const prev = { overflow: document.body.style.overflow || "" };
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = prev.overflow;
  };
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function trapFocus(container: HTMLElement) {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKey(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener("keydown", handleKey);
  return () => container.removeEventListener("keydown", handleKey);
}

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
}> = ({ open, onClose, labelledBy, children }) => {
  const mounted = useIsMounted();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const restoreScrollRef = useRef<() => void | null>(null);
  const previousFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (!open) return;

    previousFocusedRef.current =
      (document.activeElement as HTMLElement) ?? null;

    restoreScrollRef.current = lockBodyScroll();

    const el = modalRef.current;
    if (el) {
      const firstFocusable = el.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
      (firstFocusable ?? el).focus();
      const untrap = trapFocus(el);
      return () => {
        untrap();
      };
    }

    return;
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mounted, onClose]);

  useEffect(() => {
    return () => {
      if (restoreScrollRef.current) restoreScrollRef.current();
      if (previousFocusedRef.current) previousFocusedRef.current.focus();
    };
  }, []);

  if (!mounted) return null;
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-7xl h-[85vh] bg-black/75 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 ease-out"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};


export const ResultSection = memo<ResultSectionProps>(({ isLoading, result }) => {
  const parsedData = useMemo<LLMResponse | null>(() => {
    if (!result) return null;
    if (
      result.response &&
      result.response.found_items &&
      Array.isArray(result.response.found_items)
    ) {
      return result;
    }
    return null;
  }, [result]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleDownload = useCallback(async () => {
    if (!parsedData) return;

    if (!parsedData.response.found_items || parsedData.response.found_items.length === 0) {
      alert("Невозможно сгенерировать документ: список товаров пуст");
      return;
    }

    const payload = {
      id: parsedData.id,
      complexity: parsedData.complexity,
      query: parsedData.query,
      description: parsedData.description,
      response: parsedData.response,
      senderName: "Команда Без названия",
      senderContacts: "noNameCommand@example.com",
    };

    try {
      const res = await fetch("/api/generate-tkp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Generation failed:", res.status, text);
        throw new Error("Ошибка генерации ТКП");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.download = `tkp_${payload.id}_${date}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      try {
        // простая нотификация — можно заменить на toast
        // eslint-disable-next-line no-alert
        alert("Не удалось сгенерировать .docx. Проверь консоль.");
      } catch {
      }
    }
  }, [parsedData]);

  const getComplexityLabel = useCallback((complexity: string) => {
    switch (complexity) {
      case "simple":
        return "Простая";
      case "medium":
        return "Средняя";
      case "complex":
        return "Сложная";
      default:
        return complexity;
    }
  }, []);

  const getComplexityColor = useCallback((complexity: string) => {
    switch (complexity) {
      case "simple":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "complex":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  }, []);

  const TableView = useCallback(
    ({ compact = false }: { compact?: boolean }) => (
      <div className={`flex flex-col gap-4 w-full ${compact ? "" : ""}`}>
        <div className="bg-black/50 border border-gray-600 rounded-lg p-4 md:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <h3
                  id="tkp-title"
                  className="text-lg md:text-xl font-bold text-white truncate"
                >
                  ТКП #{parsedData?.id}
                </h3>
              </div>
              <p className="text-sm text-gray-300 break-words">
                {parsedData?.description || parsedData?.query}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-600">
              <span className="text-xs text-gray-400">Сложность:</span>
              <span
                className={`text-xs font-semibold ${getComplexityColor(
                  parsedData?.complexity ?? ""
                )}`}
              >
                {getComplexityLabel(parsedData?.complexity ?? "")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Позиций</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-white">
                {parsedData?.response.items_count ?? "-"}
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <RussianRuble className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Итого</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-green-400">
                {parsedData?.response.total_cost ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-gray-600 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 border-b border-gray-700">
                    №
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 border-b border-gray-700">
                    Наименование
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300 border-b border-gray-700 hidden md:table-cell">
                    Артикул
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300 border-b border-gray-700">
                    Кол-во
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-300 border-b border-gray-700 hidden sm:table-cell">
                    Цена
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-300 border-b border-gray-700">
                    Сумма
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {parsedData?.response.found_items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 text-white">
                      <div className="max-w-md">{item.name}</div>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-300 whitespace-nowrap hidden md:table-cell">
                      {item.article}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-300 whitespace-nowrap">
                      {item.count}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-300 whitespace-nowrap hidden sm:table-cell">
                      {item.unit_cost}
                    </td>
                    <td className="px-3 py-3 text-right text-white font-semibold whitespace-nowrap">
                      {item.total_cost}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-800/50 sticky bottom-0">
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-3 text-right font-bold text-white border-t border-gray-600"
                  >
                    ИТОГО:
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-green-400 text-lg border-t border-gray-600 whitespace-nowrap">
                    {parsedData?.response.total_cost ?? "-"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {parsedData?.response.description && (
          <div className="bg-black/50 border border-gray-600 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Примечания:</h4>
            <p className="text-sm text-gray-400">{parsedData.response.description}</p>
          </div>
        )}

        <Button
          onClick={handleDownload}
          className="w-full h-12 text-sm md:text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 rounded transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          {MESSAGES.DOWNLOAD}
        </Button>
      </div>
    ),
    [parsedData, getComplexityColor, getComplexityLabel, handleDownload]
  );

  return (
    <>
      <div className="space-y-4 md:space-y-8 select-none">
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<Download className="w-6 h-6 text-gray-400" />}
            title="Результат"
          />

          <div className="flex items-center gap-2">
            {parsedData && (
              <>

                <button
                  onClick={openModal}
                  aria-label="Открыть в большом окне"
                  title="Открыть в большом окне"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/60 border border-gray-700 hover:bg-gray-800 transition-shadow shadow-sm"
                >
                  <Maximize className="w-5 h-5 text-gray-200" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[12rem] md:min-h-[20rem]">
          {isLoading ? (
            <LoadingState />
          ) : parsedData ? (
            <TableView compact />
          ) : result ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg">
                <p className="text-sm text-red-400">
                  Не удалось отобразить результат. Проверь консоль для деталей.
                </p>
              </div>
              <pre className="p-4 bg-black/50 border border-gray-600 rounded text-xs text-white overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <Modal open={isModalOpen} onClose={closeModal} labelledBy="tkp-title">
        <div className="h-full p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 id="tkp-title" className="text-xl font-bold text-white truncate">
                  ТКП #{parsedData?.id}
                </h3>
              </div>
              <p className="text-sm text-gray-300 break-words">
                {parsedData?.description || parsedData?.query}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-600">
                <span className="text-xs text-gray-400">Сложность:</span>
                <span
                  className={`text-xs font-semibold ${getComplexityColor(
                    parsedData?.complexity ?? ""
                  )}`}
                >
                  {getComplexityLabel(parsedData?.complexity ?? "")}
                </span>
              </div>

              <button
                onClick={closeModal}
                aria-label="Закрыть"
                className="ml-3 w-9 h-9 rounded-full bg-gray-800/60 border border-gray-700 flex items-center justify-center hover:scale-105 transition-transform"
              >
                <X className="w-4 h-4 text-gray-200" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Позиций</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {parsedData?.response.items_count ?? "-"}
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <RussianRuble className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Итого</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {parsedData?.response.total_cost ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-lg border border-gray-700 bg-black/50">
            <div className="h-full overflow-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 border-b border-gray-700">
                      №
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 border-b border-gray-700">
                      Наименование
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300 border-b border-gray-700 hidden md:table-cell">
                      Артикул
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300 border-b border-gray-700">
                      Кол-во
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-300 border-b border-gray-700 hidden sm:table-cell">
                      Цена
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-300 border-b border-gray-700">
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {parsedData?.response.found_items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{index + 1}</td>
                      <td className="px-3 py-3 text-white">
                        <div className="max-w-2xl">{item.name}</div>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-300 whitespace-nowrap hidden md:table-cell">
                        {item.article || "-"}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-300 whitespace-nowrap">{item.count}</td>
                      <td className="px-3 py-3 text-right text-gray-300 whitespace-nowrap hidden sm:table-cell">
                        {item.unit_cost}
                      </td>
                      <td className="px-3 py-3 text-right text-white font-semibold whitespace-nowrap">
                        {item.total_cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800/50 sticky bottom-0">
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-right font-bold text-white border-t border-gray-600">
                      ИТОГО:
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-green-400 text-lg border-t border-gray-600 whitespace-nowrap">
                      {parsedData?.response.total_cost ?? "-"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1 h-12 text-sm md:text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 rounded transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {MESSAGES.DOWNLOAD}
            </Button>

            <Button
              onClick={closeModal}
              className="h-12 w-44 text-sm md:text-base font-semibold bg-gray-800 text-white hover:bg-gray-900 border border-gray-700 rounded transition-colors"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

ResultSection.displayName = "ResultSection";
