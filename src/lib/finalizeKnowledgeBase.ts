import type { KnowledgeBase } from "@/types/knowledge";

// Removes spaces around text and drops empty list items
function cleanList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter((item) => item.length > 0);
}

// Turns "" into null, so optional fields stay consistent
function cleanOptional(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Prepares the edited draft for saving
export function finalizeKnowledgeBase(kb: KnowledgeBase): KnowledgeBase {
  return {
    ...kb,
    updatedAt: new Date().toISOString(),

    foundation: {
      ...kb.foundation,
      name: kb.foundation.name.trim(),
      description: kb.foundation.description.trim(),
      industry: kb.foundation.industry.trim(),
      businessModel: cleanOptional(kb.foundation.businessModel),
      companyRole: cleanOptional(kb.foundation.companyRole),
      mainAddress: cleanOptional(kb.foundation.mainAddress),
      altNames: cleanList(kb.foundation.altNames),
      otherLocations: cleanList(kb.foundation.otherLocations),
      serviceLocations: cleanList(kb.foundation.serviceLocations),
    },

    positioning: {
      ...kb.positioning,
      pitch: cleanOptional(kb.positioning.pitch),
      foundingStory: cleanOptional(kb.positioning.foundingStory),
      uniqueSellingPoints: cleanList(kb.positioning.uniqueSellingPoints),
      differentiators: cleanList(kb.positioning.differentiators),
    },

    market: {
      ...kb.market,
      buyers: cleanList(kb.market.buyers),
      industryGroupings: cleanList(kb.market.industryGroupings),
      channels: cleanList(kb.market.channels),
      funnels: cleanList(kb.market.funnels),
      ctas: cleanList(kb.market.ctas),
      suppliers: cleanList(kb.market.suppliers),
    },

    branding: {
      ...kb.branding,
      fonts: cleanList(kb.branding.fonts),
      colors: cleanList(kb.branding.colors),
      logos: cleanList(kb.branding.logos),
    },

    keyPeople: kb.keyPeople
      .map((person) => ({ ...person, name: person.name.trim() }))
      .filter((person) => person.name.length > 0),

    offerings: kb.offerings
      .map((offering) => ({
        ...offering,
        name: offering.name.trim(),
        description: offering.description.trim(),
        pricing: cleanOptional(offering.pricing),
      }))
      .filter((offering) => offering.name.length > 0),

    content: {
      ...kb.content,
      faqs: kb.content.faqs
        .map((faq) => ({ ...faq, question: faq.question.trim(), answer: faq.answer.trim() }))
        .filter((faq) => faq.question.length > 0),
    },

    legal: {
      ...kb.legal,
      privacyPolicyUrl: cleanOptional(kb.legal.privacyPolicyUrl),
    },
  };
}