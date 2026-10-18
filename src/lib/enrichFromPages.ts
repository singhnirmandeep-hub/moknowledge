import type { DiscoveredPage, PageKind } from "@/lib/findInternalPages";
import { extractSections, type Section } from "@/lib/extractSections";
import { fetchPageHtml } from "@/lib/fetchPage";
import type { FaqEntry, KeyPerson, Offering } from "@/types/knowledge";

export interface PageContent {
  kind: PageKind;
  url: string;
  sections: Section[];
}

const KEY_KINDS: PageKind[] = ["about", "services", "team", "pricing"];

// Splits text into sentences, removes repeated sentences, and stops at a limit
// without cutting a sentence in half
export function cleanText(text: string, maxLength = 500): string {
  const pieces = text.split(/(?<=[.!?])\s+/);
  const seen = new Set<string>();
  const sentences: string[] = [];

  for (const piece of pieces) {
    const sentence = piece.trim();
    if (sentence.length === 0) continue;
    const key = sentence.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    sentences.push(sentence);
  }

  let result = "";
  for (const sentence of sentences) {
    const candidate = result ? `${result} ${sentence}` : sentence;
    if (candidate.length > maxLength) break;
    result = candidate;
  }

  return result;
}

// Fetches the important subpages at the same time
export async function fetchKeyPages(pages: DiscoveredPage[]): Promise<PageContent[]> {
  const wanted = pages.filter((p) => KEY_KINDS.includes(p.kind));

  const results = await Promise.all(
    wanted.map(async (page) => {
      const res = await fetchPageHtml(page.url);
      if (!res.ok) return null;
      return { kind: page.kind, url: page.url, sections: extractSections(res.html) };
    })
  );

  return results.filter((r): r is PageContent => r !== null);
}

// Many sites repeat the same block for mobile and desktop. Remove exact repeats.
function uniqueSections(sections: Section[]): Section[] {
  const seen = new Set<string>();
  return sections.filter((s) => {
    const key = `${s.heading}|${s.body}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// A heading ending in "?" is a question, so it belongs in FAQs
const isQuestion = (heading: string) => heading.trim().endsWith("?");

// Button labels that show up in call-to-action banners, not in real answers
const CTA_PHRASES = ["get a demo", "start for free", "contact sales", "join the waitlist"];

// Two or more button labels in one answer means it's a banner, not an FAQ
function isCallToAction(text: string): boolean {
  const lower = text.toLowerCase();
  return CTA_PHRASES.filter((phrase) => lower.includes(phrase)).length >= 2;
}

export function faqsFrom(pages: PageContent[]): FaqEntry[] {
  const faqs: FaqEntry[] = [];
  const seen = new Set<string>();

  for (const page of pages) {
    for (const section of uniqueSections(page.sections)) {
      if (!isQuestion(section.heading) || section.body.length === 0) continue;
      if (isCallToAction(section.body)) continue;
      if (seen.has(section.heading)) continue;
      seen.add(section.heading);
      const answer = cleanText(section.body);
        if (answer.length === 0) continue;
        faqs.push({ question: section.heading, answer, sourceUrl: page.url });
    }
  }

  return faqs;
}

const PRICE_PATTERN = /\$\s?\d[\d,.]*(?:\s*\/\s*(?:mo|month|year|yr))?/i;

// Services and pricing sections become offerings. Questions are skipped.
export function offeringsFrom(pages: PageContent[]): Offering[] {
  const offerings: Offering[] = [];
  const seen = new Set<string>();

  for (const page of pages) {
    if (page.kind !== "services" && page.kind !== "pricing") continue;

    for (const section of uniqueSections(page.sections)) {
      if (isQuestion(section.heading)) continue;
      if (section.body.length < 40) continue;

      const price = PRICE_PATTERN.exec(section.body)?.[0] ?? null;
      if (page.kind === "pricing" && !price) continue;
      if (seen.has(section.heading)) continue;
      seen.add(section.heading);

      offerings.push({
        name: section.heading,
        category: page.kind === "pricing" ? "package" : "service",
        description: cleanText(section.body),
        features: [],
        pricing: price,
      });
    }
  }

  return offerings;
}

// Looks for sentences like "founded in 2019" or "since 2005" on the About page.
// Used only when structured data didn't provide a year.
export function foundingYearFrom(pages: PageContent[]): number | null {
  const pattern = /(?:founded|established|since)\s+(?:in\s+)?(\d{4})/i;

  for (const page of pages.filter((p) => p.kind === "about")) {
    for (const section of page.sections) {
      const match = pattern.exec(`${section.heading} ${section.body}`);
      if (match) return Number(match[1]);
    }
  }
  return null;
}

// Matches two or three capitalized words, like "Jane Smith" or "Mary Ann Lee"
function looksLikeName(text: string): boolean {
  return /^[A-Z][a-zA-Z'-]+(\s[A-Z][a-zA-Z'-]+){1,2}$/.test(text);
}

// Team page sections whose heading looks like a name become key people (best guess)
export function keyPeopleFrom(pages: PageContent[]): KeyPerson[] {
  const people: KeyPerson[] = [];
  const seen = new Set<string>();

  for (const page of pages.filter((p) => p.kind === "team")) {
    for (const section of page.sections) {
      if (!looksLikeName(section.heading) || seen.has(section.heading)) continue;
      seen.add(section.heading);

      people.push({
        name: section.heading,
        title: null,
        gender: "unknown",
        background: section.body || null,
      });
    }
  }

  return people;
}