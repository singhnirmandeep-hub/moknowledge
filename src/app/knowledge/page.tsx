"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import UrlForm from "@/components/UrlForm";
import ScrapeResults from "@/components/ScrapeResults";
import { finalizeKnowledgeBase } from "@/lib/finalizeKnowledgeBase";
import type { ScrapeFailure, ScrapeSuccess } from "@/types/api";
import type { KnowledgeBase } from "@/types/knowledge";

export default function KnowledgePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagesRead, setPagesRead] = useState(0);
  const [draft, setDraft] = useState<KnowledgeBase | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  async function handleScrape(url: string) {
    setIsLoading(true);
    setError(null);
    setDraft(null);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const data = (await response.json()) as ScrapeSuccess | ScrapeFailure;

      if (!response.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong while scraping.");
        return;
      }

      const success = data as ScrapeSuccess;
      setDraft(success.knowledgeBase);
      setPagesRead(success.pagesRead.length + 1);
    } catch {
      setError("Could not reach the scraper. Make sure the dev server is running.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const final = finalizeKnowledgeBase(draft);

      // 1. Store the record on the server
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(final),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSaveMessage(data.error ?? "Could not save the record.");
        return;
      }

      // 2. Download a copy as a JSON file
      const json = JSON.stringify(final, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(blob);
      const fileName =
        final.foundation.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "knowledge-base";

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${fileName}.json`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      setSaveMessage(`Saved to records and downloaded ${fileName}.json.`);
    } catch {
      setSaveMessage("Could not reach the server. Make sure the dev server is running.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <PageHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900">Build a Knowledge Base</h2>
        <p className="mt-2 text-gray-600">
          Enter a company website to scrape and structure its information.
        </p>

        <div className="mt-8">
          <UrlForm onValidSubmit={handleScrape} isLoading={isLoading} />
        </div>

        {isLoading && (
          <p className="mt-6 text-sm text-gray-600">
            Scraping the website and reading its key pages. This can take 10 to 20 seconds.
          </p>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {draft && (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-gray-600">
              Read {pagesRead} pages from{" "}
              <span className="font-medium text-gray-900">{draft.sourceUrl}</span>. Edit anything
              below, then save.
            </p>

            <ScrapeResults kb={draft} onChange={setDraft} />

            <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                {saveMessage ?? "Changes are not saved until you click Save."}
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}