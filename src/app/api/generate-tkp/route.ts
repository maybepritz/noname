import { NextRequest, NextResponse } from "next/server";

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

interface TKPPayload {
  id: number;
  complexity: "simple" | "medium" | "complex";
  query: string;
  description: string;
  response: ApiResponseData;
  senderName: string;
  senderContacts: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: TKPPayload = await request.json();

    if (!payload || !payload.response || !payload.response.found_items) {
      return NextResponse.json(
        { error: "Неверный формат данных: требуется объект с полем response.found_items" },
        { status: 400 }
      );
    }

    if (!Array.isArray(payload.response.found_items) || payload.response.found_items.length === 0) {
      return NextResponse.json(
        { error: "Список товаров пуст или некорректен" },
        { status: 400 }
      );
    }

    console.log("📄 Генерация документа:", {
      id: payload.id,
      items: payload.response.items_count,
      total: payload.response.total_cost
    });

    const Document = require("docx").Document;
    const Packer = require("docx").Packer;
    const Paragraph = require("docx").Paragraph;
    const TextRun = require("docx").TextRun;
    const Table = require("docx").Table;
    const TableRow = require("docx").TableRow;
    const TableCell = require("docx").TableCell;
    const WidthType = require("docx").WidthType;
    const AlignmentType = require("docx").AlignmentType;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ",
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `ТКП #${payload.id}`,
                bold: true,
                size: 28,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Запрос: ${payload.query}`,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Описание: ${payload.description}`,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "№", alignment: AlignmentType.CENTER })],
                    shading: { fill: "CCCCCC" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Наименование", alignment: AlignmentType.CENTER })],
                    shading: { fill: "CCCCCC" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Артикул", alignment: AlignmentType.CENTER })],
                    shading: { fill: "CCCCCC" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Кол-во", alignment: AlignmentType.CENTER })],
                    shading: { fill: "CCCCCC" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Цена", alignment: AlignmentType.CENTER })],
                    shading: { fill: "CCCCCC" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Сумма", alignment: AlignmentType.CENTER })],
                    shading: { fill: "CCCCCC" },
                  }),
                ],
              }),
              
              ...payload.response.found_items.map((item, index) => 
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: item.name })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: item.article || "-", alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: item.count, alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: item.unit_cost, alignment: AlignmentType.RIGHT })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: item.total_cost, alignment: AlignmentType.RIGHT })],
                    }),
                  ],
                })
              ),
              
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "ИТОГО:", bold: true, alignment: AlignmentType.RIGHT })],
                    columnSpan: 5,
                    shading: { fill: "EEEEEE" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: payload.response.total_cost, bold: true, alignment: AlignmentType.RIGHT })],
                    shading: { fill: "EEEEEE" },
                  }),
                ],
              }),
            ],
          }),
          
          ...(payload.response.description ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "\nПримечания:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: payload.response.description,
                  size: 22,
                }),
              ],
            }),
          ] : []),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `\n\nОт: ${payload.senderName}`,
                size: 22,
              }),
            ],
            spacing: { before: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Контакты: ${payload.senderContacts}`,
                size: 22,
              }),
            ],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    console.log("✅ Документ сгенерирован:", buffer.length, "байт");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="tkp_${payload.id}_${new Date().toISOString().slice(0, 10)}.docx"`,
      },
    });

  } catch (err: any) {
    console.error("❌ Ошибка генерации документа:", err);
    return NextResponse.json({ error: err.message || "Ошибка генерации документа" }, { status: 500 });
  }
}