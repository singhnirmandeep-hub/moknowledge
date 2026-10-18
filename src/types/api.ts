import type { KnowledgeBase } from "@/types/knowledge";

export interface DiscoveredPageInfo {
  kind: string;
  url: string;
}

export interface PagesReadInfo {
  kind: string;
  url: string;
  sectionCount: number;
}

// What /api/scrape returns when it succeeds
export interface ScrapeSuccess {
  knowledgeBase: KnowledgeBase;
  discoveredPages: DiscoveredPageInfo[];
  pagesRead: PagesReadInfo[];
}

// What /api/scrape returns when it fails
export interface ScrapeFailure {
  error: string;
}