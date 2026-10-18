import * as cheerio from "cheerio";

export type PageKind = "about" | "services" | "team" | "pricing" | "contact" | "faq" | "blog";

export interface DiscoveredPage {
  kind: PageKind;
  url: string;
}

// Each pattern must match a whole path segment, like "/about" or "/help/faqs"
const PATH_PATTERNS: Record<PageKind, RegExp> = {
  about: /^(about|about-us|our-story|who-we-are|company)$/,
  services: /^(services|solutions|offerings|products|what-we-do)$/,
  team: /^(team|our-team|leadership|our-people|staff|founders)$/,
  pricing: /^(pricing|plans|prices)$/,
  contact: /^(contact|contact-us)$/,
  faq: /^(faq|faqs|questions)$/,
  blog: /^(blog|news|resources|articles)$/,
};

const stripWww = (host: string) => host.replace(/^www\./, "");

export function findInternalPages(html: string, pageUrl: string): DiscoveredPage[] {
  const $ = cheerio.load(html);
  const base = new URL(pageUrl);
  const found = new Map<PageKind, string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    let link: URL;
    try {
      link = new URL(href, pageUrl);
    } catch {
      return;
    }

    if (stripWww(link.hostname) !== stripWww(base.hostname)) return;

    const segments = link.pathname.toLowerCase().split("/").filter(Boolean);

    for (const kind of Object.keys(PATH_PATTERNS) as PageKind[]) {
      if (found.has(kind)) continue;
      if (segments.some((segment) => PATH_PATTERNS[kind].test(segment))) {
        found.set(kind, link.origin + link.pathname);
      }
    }
  });

  return Array.from(found, ([kind, url]) => ({ kind, url }));
}