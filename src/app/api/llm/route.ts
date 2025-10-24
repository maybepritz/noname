import { NextRequest, NextResponse } from "next/server";
import { readFileAsString } from "@/lib/readFile";

interface LLMFoundItem {
  name: string;
  article?: string;
  count: number;
  unit_cost: number;
}

interface LLMRawResponse {
  id: number;
  complexity: "simple" | "medium" | "complex";
  query: string;
  description: string;
  found_items: LLMFoundItem[];
  additional_notes?: string;
}

interface FoundItem {
  name: string;
  article?: string;
  count: string;
  unit_cost: string;
  total_cost: string;
}

interface ApiResponseData {
  found_items: FoundItem[];
  items_count: number;
  total_cost: string;
  description?: string;
}

interface LLMResponse {
  id: number;
  complexity: "simple" | "medium" | "complex";
  query: string;
  description: string;
  response: ApiResponseData;
}

function formatPrice(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' руб.';
}

function calculateResponse(llmData: LLMRawResponse): LLMResponse {
  let totalSum = 0;
  
  const calculatedItems: FoundItem[] = llmData.found_items.map((item) => {
    const itemTotal = item.count * item.unit_cost;
    totalSum += itemTotal;
    
    return {
      name: item.name,
      article: item.article,
      count: item.count.toString(),
      unit_cost: formatPrice(item.unit_cost),
      total_cost: formatPrice(itemTotal),
    };
  });

  return {
    id: llmData.id,
    complexity: llmData.complexity,
    query: llmData.query,
    description: llmData.description,
    response: {
      found_items: calculatedItems,
      items_count: calculatedItems.length,
      total_cost: formatPrice(totalSum),
      description: llmData.additional_notes,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const inst = readFileAsString("instructions.txt");
    const mats = readFileAsString("materials.csv");

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await fetch("http://192.168.43.225:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen/qwen3-4b-thinking-2507",
        messages: [
          { role: "system", content: mats + inst },
          { role: "user", content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "product_search_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                id: { type: "integer", description: "Уникальный ID запроса" },
                complexity: { 
                  type: "string", 
                  enum: ["simple", "medium", "complex"],
                  description: "Сложность запроса"
                },
                query: { type: "string", description: "Исходный запрос пользователя" },
                description: { type: "string", description: "Краткое описание запроса" },
                found_items: {
                  type: "array",
                  description: "Список найденных товаров",
                  items: {
                    type: "object",
                    properties: {
                      name: { 
                        type: "string",
                        description: "Полное название товара"
                      },
                      article: { 
                        type: "string",
                        description: "Артикул товара"
                      },
                      count: { 
                        type: "integer",
                        description: "Количество единиц товара",
                        minimum: 1
                      },
                      unit_cost: { 
                        type: "number",
                        description: "Цена за единицу товара в рублях (число)",
                        minimum: 0
                      }
                    },
                    required: ["name", "count", "unit_cost"],
                    additionalProperties: false
                  }
                },
                additional_notes: {
                  type: "string",
                  description: "Дополнительные примечания или комментарии к заказу"
                }
              },
              required: ["id", "complexity", "query", "description", "found_items"],
              additionalProperties: false
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    try {
      const llmRawResponse: LLMRawResponse = JSON.parse(text);

      if (!llmRawResponse.found_items || !Array.isArray(llmRawResponse.found_items)) {
        return NextResponse.json({
          error: "LLM не вернула корректный формат данных",
          raw_response: text
        }, { status: 500 });
      }

      if (llmRawResponse.found_items.length === 0) {
        console.log("⚠️ LLM не нашла товаров:", llmRawResponse.description);
        
        return NextResponse.json({
          error: llmRawResponse.description || "Товары не найдены. Попробуйте уточнить запрос.",
          details: {
            query: llmRawResponse.query,
            complexity: llmRawResponse.complexity,
            notes: llmRawResponse.additional_notes
          }
        }, { status: 404 });
      }

      for (const item of llmRawResponse.found_items) {
        if (typeof item.count !== "number" || typeof item.unit_cost !== "number") {
          return NextResponse.json({
            error: `Некорректный формат данных в товаре: ${item.name}`,
            raw_response: text
          }, { status: 500 });
        }
        
        if (item.count <= 0 || item.unit_cost < 0) {
          return NextResponse.json({
            error: `Некорректные значения для товара: ${item.name}`,
            raw_response: text
          }, { status: 500 });
        }
      }

      console.log("✅ LLM вернула данные:", {
        items: llmRawResponse.found_items.length,
        query: llmRawResponse.query
      });

      const calculatedResponse = calculateResponse(llmRawResponse);

      console.log("✅ Расчет выполнен:", {
        items: calculatedResponse.response.items_count,
        total: calculatedResponse.response.total_cost,
      });

      return NextResponse.json({ response: calculatedResponse });

    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", text);
      return NextResponse.json({
        error: "Не удалось распарсить ответ модели",
        raw_response: text
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}