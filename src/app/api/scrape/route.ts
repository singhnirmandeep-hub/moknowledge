import { NextResponse } from "next/server";
import { validateCompanyUrl } from "@/lib/validateUrl";
import { fetchPageHtml } from "@/lib/fetchPage";
import { extractMetadata } from "@/lib/extractMetadata";
import { extractStructuredData } from "@/lib/extractStructuredData";
import { findInternalPages } from "@/lib/findInternalPages";
import { buildKnowledgeBase } from "@/lib/buildKnowledgeBase";
import {
  fetchKeyPages,
  offeringsFrom,
  keyPeopleFrom,
  faqsFrom,
  foundingYearFrom,
} from "@/lib/enrichFromPages";

// Handles GET requests to /api/scrape?url=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url") ?? "";

  const validation = validateCompanyUrl(raw);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const result = await fetchPageHtml(validation.url);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const metadata = extractMetadata(result.html, result.finalUrl);
  const structured = extractStructuredData(result.html);
  const discoveredPages = findInternalPages(result.html, result.finalUrl);

  const base = buildKnowledgeBase({
    sourceUrl: result.finalUrl,
    metadata,
    structured,
  });

  const pageContents = await fetchKeyPages(discoveredPages);

  const knowledgeBase = {
    ...base,
    foundation: {
      ...base.foundation,
      yearFounded: base.foundation.yearFounded ?? foundingYearFrom(pageContents),
    },
    offerings: offeringsFrom(pageContents),
    keyPeople: keyPeopleFrom(pageContents),
    content: {
      ...base.content,
      faqs: faqsFrom(pageContents),
    },
  };

  return NextResponse.json({
    knowledgeBase,
    discoveredPages,
    pagesRead: pageContents.map((p) => ({
      kind: p.kind,
      url: p.url,
      sectionCount: p.sections.length,
    })),
  });
}