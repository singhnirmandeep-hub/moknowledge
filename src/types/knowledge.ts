// ---------- Helper types ----------

export type SocialPlatform =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "twitter"
  | "youtube"
  | "tiktok";

export type Gender = "male" | "female" | "unknown";

export type OfferingCategory =
  | "product"
  | "service"
  | "package"
  | "property"
  | "other";

// ---------- Company Foundation ----------

export interface CompanyFoundation {
  name: string;
  altNames: string[];
  description: string;
  website: string;
  industry: string;
  businessModel: string | null;
  companyRole: string | null;
  yearFounded: number | null;
  legalEntityType: string | null;
  employeeCount: number | null;
  mainAddress: string | null;
  otherLocations: string[];
  serviceLocations: string[];
}

// ---------- Positioning ----------

export interface Positioning {
  pitch: string | null;
  foundingStory: string | null;
  uniqueSellingPoints: string[];   // Think Bigger
  differentiators: string[];       // Think Bigger
}

// ---------- Market & Customers ----------

export interface MarketAndCustomers {
  buyers: string[];
  customerNeeds: string | null;
  idealPersona: string | null;
  industryGroupings: string[];
  industryOutlook: string | null;
  channels: string[];
  funnels: string[];
  ctas: string[];
  suppliers: string[];
}

// ---------- Branding & Style ----------

export interface BrandingAndStyle {
  writingStyle: string | null;
  artStyle: string | null;
  fonts: string[];
  colors: string[];   // hex values like "#2663eb"
  logos: string[];    // image URLs
}

// ---------- Online Presence ----------

export interface OnlinePresence {
  socialLinks: Partial<Record<SocialPlatform, string>>;
}

// ---------- Key People ----------

export interface KeyPerson {
  name: string;
  title: string | null;
  gender: Gender;
  background: string | null;
}

// ---------- Offerings ----------

export interface Offering {
  name: string;
  category: OfferingCategory;
  description: string;
  features: string[];
  pricing: string | null;
}

// ---------- Think Bigger: extra intelligence ----------

export interface Testimonial {
  quote: string;
  author: string | null;
}

export interface FaqEntry {
  question: string;
  answer: string;
  sourceUrl?: string;   // the page the FAQ was read from
}

export interface TrustSignals {
  certifications: string[];
  awards: string[];
  yearsInBusiness: number | null;
  testimonials: Testimonial[];
}

export interface ContentSignals {
  topics: string[];          // what the company talks about most
  faqs: FaqEntry[];
  seasonalMessages: string[];
  community: string[];       // charity, sponsorships, values
}

export interface LegalInfo {
  privacyPolicyUrl: string | null;
  hasDisclaimers: boolean;
}

// ---------- The full knowledge base ----------

export interface KnowledgeBase {
  id: string;
  schemaVersion: number;     // lets us change the shape later without breaking old records
  sourceUrl: string;
  createdAt: string;         // ISO date text, like "2026-10-16T14:30:00Z"
  updatedAt: string;

  foundation: CompanyFoundation;
  positioning: Positioning;
  market: MarketAndCustomers;
  branding: BrandingAndStyle;
  online: OnlinePresence;
  keyPeople: KeyPerson[];
  offerings: Offering[];

  trust: TrustSignals;       // Think Bigger
  content: ContentSignals;   // Think Bigger
  legal: LegalInfo;          // Think Bigger
}