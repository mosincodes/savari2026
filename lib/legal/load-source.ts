import fs from "node:fs/promises";
import path from "node:path";

/** UTF-8 text exported from the legal DOCX drafts (repo copies). */
export async function readLegalSource(filename: string): Promise<string> {
  const p = path.join(process.cwd(), "lib/legal/sources", filename);
  return fs.readFile(p, "utf8");
}
