import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { KnowledgeBase } from "@/types/knowledge";

// Records are stored in moknowledge/data/knowledge-records.json
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "knowledge-records.json");

// Reads the whole file. A missing file means no records yet.
async function readAll(): Promise<KnowledgeBase[]> {
  try {
    const text = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(text) as KnowledgeBase[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

// Writes the whole list back, creating the data folder if needed
async function writeAll(records: KnowledgeBase[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
}

export async function listRecords(): Promise<KnowledgeBase[]> {
  return readAll();
}

export async function getRecord(id: string): Promise<KnowledgeBase | null> {
  const records = await readAll();
  return records.find((r) => r.id === id) ?? null;
}

// Replaces the record with the same id, or adds it if it's new
export async function upsertRecord(kb: KnowledgeBase): Promise<KnowledgeBase> {
  const records = await readAll();
  const index = records.findIndex((r) => r.id === kb.id);
  if (index === -1) {
    records.push(kb);
  } else {
    records[index] = kb;
  }
  await writeAll(records);
  return kb;
}

// Returns true if a record was removed
export async function deleteRecord(id: string): Promise<boolean> {
  const records = await readAll();
  const remaining = records.filter((r) => r.id !== id);
  if (remaining.length === records.length) return false;
  await writeAll(remaining);
  return true;
}