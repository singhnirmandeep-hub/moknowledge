"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import RecordTable from "@/components/RecordTable";
import type { KnowledgeBase } from "@/types/knowledge";

export default function ViewRecordsPage() {
  const [records, setRecords] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Load the saved records once, when the page opens
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/records");
        const data = (await response.json()) as { records?: KnowledgeBase[]; error?: string };
        if (!response.ok || !data.records) {
          setError(data.error ?? "Could not load records.");
          return;
        }
        setRecords(data.records);
      } catch {
        setError("Could not reach the server. Make sure the dev server is running.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Recalculated only when the records or the search text change
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((kb) =>
      [kb.foundation.name, kb.foundation.website, kb.foundation.description, kb.foundation.industry]
        .some((text) => text.toLowerCase().includes(q))
    );
  }, [records, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Saved Records</h2>
            <p className="mt-2 text-gray-600">
              {isLoading ? "Loading..." : `${records.length} saved knowledge base${records.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, website, or description"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:w-80"
          />
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8">
          {!isLoading && !error && records.length === 0 && (
            <p className="text-sm text-gray-500">
              No records yet. Scrape a website on the Build page and click Save.
            </p>
          )}
          {!isLoading && records.length > 0 && filtered.length === 0 && (
            <p className="text-sm text-gray-500">No records match &ldquo;{query}&rdquo;.</p>
          )}
          {filtered.length > 0 && <RecordTable records={filtered} />}
        </div>
      </main>
    </div>
  );
}