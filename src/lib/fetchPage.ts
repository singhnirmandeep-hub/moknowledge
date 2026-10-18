export type FetchResult =
  | { ok: true; html: string; finalUrl: string }
  | { ok: false; error: string };

// Identifies our scraper honestly to the websites we visit
const USER_AGENT = "Mozilla/5.0 (compatible; MoKnowledgeBot/1.0; +https://moflo.ai)";

export async function fetchPageHtml(url: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "follow",                      // follow http -> https and www redirects
      signal: AbortSignal.timeout(10000),      // give up after 10 seconds
    });

    if (!response.ok) {
      return { ok: false, error: `The website responded with status ${response.status}.` };
    }

    // Make sure we received a web page, not a PDF or an image
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return { ok: false, error: "That address did not return a web page." };
    }

    const html = await response.text();
    return { ok: true, html, finalUrl: response.url };
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { ok: false, error: "The website took too long to respond." };
    }
    return { ok: false, error: "Could not reach the website. Check the address and try again." };
  }
}