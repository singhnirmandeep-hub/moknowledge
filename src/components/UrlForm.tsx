"use client";

import { useState, FormEvent } from "react";
import { validateCompanyUrl } from "@/lib/validateUrl";

interface UrlFormProps {
  onValidSubmit: (url: string) => void;
  isLoading?: boolean;
}

export default function UrlForm({ onValidSubmit, isLoading = false }: UrlFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stops the browser from reloading the page

    const result = validateCompanyUrl(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    onValidSubmit(result.url);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://example.com"
        disabled={isLoading}
        aria-invalid={error !== null}
        aria-describedby={error ? "url-error" : undefined}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Scraping..." : "Scrape Website"}
      </button>
      {error && (
        <p id="url-error" className="w-full text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}