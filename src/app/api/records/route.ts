import { NextResponse } from "next/server";
import { listRecords, upsertRecord } from "@/lib/recordStore";
import type { KnowledgeBase } from "@/types/knowledge";

// GET /api/records returns every saved record
export async function GET() {
  try {
    const records = await listRecords();
    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ error: "Could not read saved records." }, { status: 500 });
  }
}

// POST /api/records saves a knowledge base (adds it, or updates it if the id exists)
export async function POST(request: Request) {
  let body: Partial<KnowledgeBase>;
  try {
    body = (await request.json()) as Partial<KnowledgeBase>;
  } catch {
    return NextResponse.json({ error: "The request body is not valid JSON." }, { status: 400 });
  }

  // Check the essentials before writing anything to disk
  if (typeof body.id !== "string" || !body.foundation || !body.sourceUrl) {
    return NextResponse.json({ error: "The record is missing required fields." }, { status: 400 });
  }

  try {
    const saved = await upsertRecord(body as KnowledgeBase);
    return NextResponse.json({ record: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not write the record to disk." }, { status: 500 });
  }
}