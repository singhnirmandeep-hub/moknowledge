import * as cheerio from "cheerio";

export interface Section {
  heading: string;
  body: string;
}

// Elements that hold code, not copy, or that browsers never show to visitors
const NEVER_VISIBLE =
  "script, style, noscript, template, svg, iframe, object, canvas, nav, footer, [hidden]";

// Inline styles that hide an element, such as style="display: none"
const HIDDEN_STYLE = /display\s*:\s*none/i;

// Turns a page into a list of "heading + the visible text under it"
export function extractSections(html: string): Section[] {
  const $ = cheerio.load(html);

  $(NEVER_VISIBLE).remove();

  // Remove anything hidden by an inline style
  $("[style]").each((_, el) => {
    if (HIDDEN_STYLE.test($(el).attr("style") ?? "")) {
      $(el).remove();
    }
  });

  const root = $("main").length > 0 ? $("main") : $("body");
  const sections: Section[] = [];

  root.find("h1, h2, h3, h4, p, li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length === 0) return;

    if ($(el).is("h1, h2, h3, h4")) {
      sections.push({ heading: text, body: "" });
      return;
    }

    const last = sections.at(-1);
    if (last) {
      last.body = last.body ? `${last.body} ${text}` : text;
    }
  });

  return sections.filter((s) => s.heading.length > 0);
}