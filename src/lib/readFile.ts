import fs from "fs";
import path from "path";

export function readFileAsString(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const filePath = path.join(process.cwd(), "public", filename);

  if (!fs.existsSync(filePath)) throw new Error("Файл не найден: " + filename);

  if (ext === ".txt" || ext === ".csv") {
    return fs.readFileSync(filePath, "utf-8");
  } else if (ext === ".pdf") {
    const buf = fs.readFileSync(filePath);
    return buf.toString("base64");
  } else {
    throw new Error("Unsupported file type: " + ext);
  }
}
