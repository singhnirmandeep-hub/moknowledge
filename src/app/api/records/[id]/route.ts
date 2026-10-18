import { NextResponse } from "next/server";
import { getRecord, deleteRecord } from "@/lib/recordStore";

type Context = { params: Promise<{ id: string }> };

// GET /api/records/<id> returns one record
export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  try {
    const record = await getRecord(id);
    if (!record) {
      return NextResponse.json({ error: "No record with that id." }, { status: 404 });
    }
    return NextResponse.json({ record });
  } catch {
    return NextResponse.json({ error: "Could not read saved records." }, { status: 500 });
  }
}

// DELETE /api/records/<id> removes one record
export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  try {
    const removed = await deleteRecord(id);
    if (!removed) {
      return NextResponse.json({ error: "No record with that id." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete the record." }, { status: 500 });
  }
}