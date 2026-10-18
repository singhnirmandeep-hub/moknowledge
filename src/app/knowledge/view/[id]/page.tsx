"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ScrapeResults from "@/components/ScrapeResults";
import { finalizeKnowledgeBase } from "@/lib/finalizeKnowledgeBase";
import type { KnowledgeBase } from "@/types/knowledge";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [draft, setDraft] = useState<KnowledgeBase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Load this one record when the page opens
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/records/${encodeURIComponent(id)}`);
        const data = (await response.json()) as { record?: KnowledgeBase; error?: string };
        if (!response.ok || !data.record) {
          setError(data.error ?? "Could not load this record.");
          return;
        }
        setDraft(data.record);
      } catch {
        setError("Could not reach the server. Make sure the dev server is running.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    if (!draft) return;
    setIsBusy(true);
    setMessage(null);

    try {
      const final = finalizeKnowledgeBase(draft);
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(final),
      });
      const data = (await response.json()) as { record?: KnowledgeBase; error?: string };
      if (!response.ok || !data.record) {
        setMessage(data.error ?? "Could not save the record.");
        return;
      }
      setDraft(data.record);
      setMessage("Changes saved.");
    } catch {
      setMessage("Could not reach the server.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    if (!draft) return;
    const confirmed = window.confirm(`Delete ${draft.foundation.name}? This cannot be undone.`);
    if (!confirmed) return;

    setIsBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/records/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setMessage(data.error ?? "Could not delete the record.");
        return;
      }
      router.push("/knowledge/view");
    } catch {
      setMessage("Could not reach the server.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/knowledge/view" className="text-sm font-medium text-blue-600 hover:underline">
          &larr; Back to Saved Records
        </Link>

        {isLoading && <p className="mt-6 text-sm text-gray-600">Loading record...</p>}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {draft && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{draft.foundation.name}</h2>
              <p className="mt-1 text-sm text-gray-500">Source: {draft.sourceUrl}</p>
            </div>

            <ScrapeResults kb={draft} onChange={setDraft} />

            <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                {message ?? "Edit any field, then click Save."}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isBusy}
                  className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isBusy}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isBusy ? "Working..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}