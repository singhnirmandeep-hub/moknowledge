import * as cheerio from "cheerio";

export interface StructuredData {
  name: string | null;
  description: string | null;
  foundingYear: number | null;
  addresses: string[];
  logoUrl: string | null;
  sameAs: string[];
}

type JsonNode = Record<string, unknown>;

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

// JSON-LD can be one object, an array, or wrap everything in "@graph".
// This flattens all of those into one list.
function collectNodes(value: unknown, out: JsonNode[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectNodes(item, out);
    return;
  }
  if (value && typeof value === "object") {
    const node = value as JsonNode;
    out.push(node);
    if (node["@graph"]) collectNodes(node["@graph"], out);
  }
}

// "@type" can be a string or a list, like ["Organization", "LocalBusiness"]
function isCompanyNode(node: JsonNode): boolean {
  return asArray(node["@type"]).some(
    (t) => typeof t === "string" && /Organization|Corporation|LocalBusiness|ProfessionalService|Store/.test(t)
  );
}

function formatAddress(value: unknown): string | null {
  if (typeof value === "string") return asText(value);
  if (value && typeof value === "object") {
    const a = value as JsonNode;
    const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry]
      .map(asText)
      .filter((p): p is string => p !== null);
    return parts.length > 0 ? parts.join(", ") : null;
  }
  return null;
}

// "logo" can be a plain URL or an object with a "url" field
function formatLogo(value: unknown): string | null {
  if (typeof value === "string") return asText(value);
  if (value && typeof value === "object") return asText((value as JsonNode).url);
  return null;
}

export function extractStructuredData(html: string): StructuredData {
  const $ = cheerio.load(html);
  const nodes: JsonNode[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      collectNodes(JSON.parse($(el).contents().text()), nodes);
    } catch {
      // Malformed JSON-LD is common on real sites. Skip it and keep going.
    }
  });

  const result: StructuredData = {
    name: null,
    description: null,
    foundingYear: null,
    addresses: [],
    logoUrl: null,
    sameAs: [],
  };

  for (const node of nodes.filter(isCompanyNode)) {
    result.name ??= asText(node.name);
    result.description ??= asText(node.description);
    result.logoUrl ??= formatLogo(node.logo);

    if (result.foundingYear === null) {
      const match = /\d{4}/.exec(String(node.foundingDate ?? ""));
      if (match) result.foundingYear = Number(match[0]);
    }

    const address = formatAddress(node.address);
    if (address && !result.addresses.includes(address)) {
      result.addresses.push(address);
    }

    for (const link of asArray(node.sameAs)) {
      const text = asText(link);
      if (text && !result.sameAs.includes(text)) result.sameAs.push(text);
    }
  }

  return result;
}