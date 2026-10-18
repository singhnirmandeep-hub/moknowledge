import { createHash } from "crypto";
import type { KnowledgeBase } from "@/types/knowledge";
import { detectPlatform, type PageMetadata, type SocialPlatformName } from "@/lib/extractMetadata";
import type { StructuredData } from "@/lib/extractStructuredData";

// Same website always gives the same id, so re-scraping replaces the old record
function idFromUrl(sourceUrl: string): string {
  const normalized = sourceUrl.trim().toLowerCase().replace(/\/+$/, "");
  const hex = createHash("sha256").update(normalized).digest("hex");
  // Format the first 32 hex characters like a UUID: 8-4-4-4-12
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export interface BuildInput {
  sourceUrl: string;
  metadata: PageMetadata;
  structured: StructuredData;
}

export function buildKnowledgeBase({ sourceUrl, metadata, structured }: BuildInput): KnowledgeBase {
  const now = new Date().toISOString();

  // Social links come from two sources: visible links on the page and schema.org "sameAs"
  const socialLinks: Partial<Record<SocialPlatformName, string>> = { ...metadata.socialLinks };
  for (const link of structured.sameAs) {
    try {
      const platform = detectPlatform(new URL(link).hostname);
      if (platform && !socialLinks[platform]) socialLinks[platform] = link;
    } catch {
      // Not a valid URL, so skip it
    }
  }

  const [firstAddress, ...otherAddresses] = structured.addresses;
  const logo = structured.logoUrl ?? metadata.logoUrl;

  return {
    id: idFromUrl(sourceUrl),
    schemaVersion: 1,
    sourceUrl,
    createdAt: now,
    updatedAt: now,

    foundation: {
      name: structured.name ?? metadata.siteName ?? metadata.title ?? sourceUrl,
      altNames: [],
      description: structured.description ?? metadata.description ?? "",
      website: sourceUrl,
      industry: "",               // filled in by the AI step later
      businessModel: null,
      companyRole: null,
      yearFounded: structured.foundingYear,
      legalEntityType: null,
      employeeCount: null,
      mainAddress: firstAddress ?? null,
      otherLocations: otherAddresses,
      serviceLocations: [],
    },

    positioning: {
      pitch: metadata.description,
      foundingStory: null,
      uniqueSellingPoints: [],
      differentiators: [],
    },

    market: {
      buyers: [],
      customerNeeds: null,
      idealPersona: null,
      industryGroupings: [],
      industryOutlook: null,
      channels: [],
      funnels: [],
      ctas: [],
      suppliers: [],
    },

    branding: {
      writingStyle: null,
      artStyle: null,
      fonts: [],
      colors: metadata.themeColor ? [metadata.themeColor] : [],
      logos: logo ? [logo] : [],
    },

    online: { socialLinks },

    keyPeople: [],
    offerings: [],

    trust: { certifications: [], awards: [], yearsInBusiness: null, testimonials: [] },
    content: { topics: [], faqs: [], seasonalMessages: [], community: [] },
    legal: { privacyPolicyUrl: null, hasDisclaimers: false },
  };
}