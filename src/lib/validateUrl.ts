export type UrlValidationResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export function validateCompanyUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: "Please enter a website address." };
  }

  // Users often type "example.com" without "https://", so add it if missing
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { ok: false, error: "That doesn't look like a valid web address." };
  }

  // A real domain needs a dot, like "moflo.ai". "localhost" or "hello" fails.
  if (!parsed.hostname.includes(".")) {
    return { ok: false, error: "Enter a full domain, like example.com." };
  }

  // origin keeps only "https://moflo.ai" and drops any extra path
  return { ok: true, url: parsed.origin };
}