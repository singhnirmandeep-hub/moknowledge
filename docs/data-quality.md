# Data Quality Strategy

Websites are inconsistent. Some companies publish a founding year, an address, and a full team page. Others publish a single homepage with a logo and a sentence. This document explains what MoKnowledge does when information is missing, unclear, or unreliable, and where the limits are.

## The core rule: null is better than a guess

Every field in the knowledge base is either filled from a source we can point to, or it's left empty. Empty means `null` for single values and `[]` for lists. The app never invents a value to fill a gap. The editing page shows empty fields as "Not found," so you can see what the scraper missed and fill it in by hand.

## Fallback chains

When a value can come from more than one place, the scraper tries the most reliable source first and moves down the list only if the one above is empty.

| Field | Tried in this order |
|---|---|
| Company name | Schema.org `name`, then `og:site_name`, then the page `<title>`, then the website address |
| Description | Schema.org `description`, then `<meta name="description">`, then `og:description` |
| Year founded | Schema.org `foundingDate`, then a sentence on the About page such as "founded in 2019" |
| Main address | First schema.org `address` |
| Logo | An `<img>` with "logo" in its file name or alt text, then `og:image`, then the favicon |
| Social links | Links on the page, then schema.org `sameAs` entries. The first link found for each platform wins |
| Pitch | The meta description |

Each step is a fallback, not a merge. If the schema.org name exists, the scraper uses it and ignores the others. This keeps the result predictable.

## Cleaning messy text

Raw page text causes its own problems, so the scraper cleans it before any field is filled:

- **Hidden content is skipped.** Scripts, styles, navigation, footers, and elements marked `hidden` or set to `display: none` are removed before reading. Accordions that visitors can open are kept, because they're visible when clicked.
- **Repeated content is removed.** Many sites repeat the same block for mobile and desktop. Identical sections are dropped.
- **Whitespace is normalized.** Line breaks and extra spaces are collapsed into single spaces.
- **Answers end on whole sentences.** Long text is cut at a sentence boundary, never in the middle of a word.
- **Banners are filtered.** A call-to-action block with two or more button labels, such as "Get a demo" and "Start for free," is not treated as an FAQ.
- **Malformed structured data is skipped.** A broken JSON-LD block is ignored, so one bad tag doesn't stop the whole scrape.

## Checking every value

Each value that comes from text has a source. FAQs record the page they were read from. The prompts in `prompts/` also require a quote for every extracted value, so a reviewer can search the source and confirm it. The current scraper doesn't yet check those quotes automatically. That check is listed under future work.

## Known gaps

Some fields will often be empty, even when the company has the information:

- **Employee count and legal entity type** are rarely published on websites.
- **Titles of key people** are hard to identify with simple rules, so they're left empty unless a team page makes them obvious.
- **Gender** is never guessed from a name. It's set to `unknown` unless a source states it.
- **Industry, writing style, and art style** need interpretation, which rules can't do reliably. They're left for the AI step.
- **Content behind JavaScript** may not appear, since the scraper only reads the HTML the server returns.
- **Text hidden with external CSS** can't be detected, so some hidden text may still come through.

## Where AI and outside data would help

The gaps above are where the AI prompts and outside sources would add the most value:

- **AI interpretation** could fill industry, writing style, and ideal persona from the text, with quotes as evidence.
- **Business registries**, such as state corporation databases, could confirm the legal entity type and the year of formation.
- **Business listing profiles**, such as Google Business Profile, could supply the address, hours, and review counts.
- **Knowledge databases**, such as Wikidata, could confirm the founding year and leadership for well-known companies.

Each outside source would need its own check, because a wrong match is worse than an empty field.

## Summary

When data is missing, MoKnowledge leaves it empty and says so. When data conflicts, it prefers the most structured source. When data is unclear, a person reviews it before saving. The app is built to show what it knows and what it doesn't, so incomplete data stays visible instead of being hidden behind a confident guess.