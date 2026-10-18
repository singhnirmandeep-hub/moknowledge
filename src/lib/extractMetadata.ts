import * as cheerio from "cheerio";

export type SocialPlatformName =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "twitter"
  | "youtube"
  | "tiktok";

export interface PageMetadata {
  title: string | null;
  description: string | null;
  siteName: string | null;
  language: string | null;
  canonicalUrl: string | null;
  logoUrl: string | null;
  themeColor: string | null;
  socialLinks: Partial<Record<SocialPlatformName, string>>;
}

// Collapses extra whitespace and returns null for empty text
function clean(value: string | undefined | null): string | null {
  if (!value) return null;
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

// Turns "/images/logo.png" into "https://moflo.ai/images/logo.png"
function toAbsolute(href: string | undefined, pageUrl: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, pageUrl).toString();
  } catch {
    return null;
  }
}

// Maps a link's domain to a social platform name
export function detectPlatform(hostname: string): SocialPlatformName | null {
  const host = hostname.replace(/^www\./, "");
  if (host === "linkedin.com") return "linkedin";
  if (host === "facebook.com") return "facebook";
  if (host === "instagram.com") return "instagram";
  if (host === "twitter.com" || host === "x.com") return "twitter";
  if (host === "youtube.com" || host === "youtu.be") return "youtube";
  if (host === "tiktok.com") return "tiktok";
  return null;
}

export function extractMetadata(html: string, pageUrl: string): PageMetadata {
  const $ = cheerio.load(html);

  // Looks for <meta name="..."> first, then <meta property="..."> (Open Graph)
  const meta = (key: string): string | null => {
    const content =
      $(`meta[name="${key}"]`).attr("content") ??
      $(`meta[property="${key}"]`).attr("content");
    return clean(content);
  };

  // Social links: keep the first link found for each platform,
  // and skip "share" buttons, which point to other people's profiles
  const socialLinks: PageMetadata["socialLinks"] = {};
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const absolute = toAbsolute(href, pageUrl);
    if (!absolute) return;

    const url = new URL(absolute);
    const platform = detectPlatform(url.hostname);
    if (!platform) return;
    if (url.pathname.includes("share") || url.pathname.includes("sharer")) return;
    if (!socialLinks[platform]) {
      socialLinks[platform] = absolute;
    }
  });

  // Logo: prefer an <img> whose src or alt mentions "logo",
  // then fall back to the Open Graph image, then the favicon
  let logoUrl: string | null = null;
  $("img").each((_, el) => {
    if (logoUrl) return;
    const src = $(el).attr("src") ?? "";
    const alt = $(el).attr("alt") ?? "";
    if (/logo/i.test(src) || /logo/i.test(alt)) {
      logoUrl = toAbsolute(src, pageUrl);
    }
  });
  if (!logoUrl) {
    logoUrl = toAbsolute(meta("og:image") ?? undefined, pageUrl);
  }
  if (!logoUrl) {
    const icon = $('link[rel~="icon"]').first().attr("href");
    logoUrl = toAbsolute(icon, pageUrl);
  }

  return {
    title: clean($("title").first().text()),
    description: meta("description") ?? meta("og:description"),
    siteName: meta("og:site_name"),
    language: clean($("html").attr("lang")),
    canonicalUrl: toAbsolute($('link[rel="canonical"]').attr("href"), pageUrl),
    logoUrl,
    themeColor: meta("theme-color"),
    socialLinks,
  };
}