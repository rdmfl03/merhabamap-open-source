import { CONTENT_SCREEN_URL_REGEX } from "./url-tokenize";

export type ContentScreenContext =
  | "comment"
  | "post"
  | "business_post"
  | "claim_message"
  | "profile_bio"
  | "chat_message"
  | "community_submission"
  | "community_team_message"
  | "report_notes";

export type ContentScreenConfig = {
  blockedDomains?: Iterable<string>;
  blockedKeywords?: Iterable<string>;
};

export type ContentScreenResult =
  | { ok: true }
  | {
      ok: false;
      reason: "blocked_domain" | "blocked_keyword" | "too_many_urls" | "link_density";
      match?: string;
    };

const DEFAULT_BLOCKED_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "is.gd",
  "t.co",
  "goo.gl",
  "ow.ly",
  "buff.ly",
  "shorturl.at",
]);

const DEFAULT_BLOCKED_KEYWORDS = [
  "viagra",
  "casino online",
  "bitcoin doubler",
  "nft whitelist",
  "crypto airdrop",
  "get rich quick",
] as const;

const MAX_URLS_BY_CONTEXT: Record<ContentScreenContext, number> = {
  comment: 1,
  post: 2,
  business_post: 2,
  claim_message: 3,
  profile_bio: 1,
  chat_message: 3,
  community_submission: 2,
  community_team_message: 1,
  report_notes: 1,
};

const SKIP_LINK_DENSITY_WITHIN_BUDGET = new Set<ContentScreenContext>([
  "chat_message",
  "claim_message",
]);

function normalizedSet(values: Iterable<string> | undefined): Set<string> {
  return new Set(Array.from(values ?? [], (value) => value.trim().toLowerCase()).filter(Boolean));
}

function mergedBlockedDomains(config: ContentScreenConfig): Set<string> {
  return new Set([...DEFAULT_BLOCKED_DOMAINS, ...normalizedSet(config.blockedDomains)]);
}

function mergedBlockedKeywords(config: ContentScreenConfig): string[] {
  return [
    ...DEFAULT_BLOCKED_KEYWORDS,
    ...normalizedSet(config.blockedKeywords),
  ];
}

function extractUrls(text: string): string[] {
  const regex = new RegExp(CONTENT_SCREEN_URL_REGEX.source, "gi");
  return (text.match(regex) ?? []).map((match) => match.trim());
}

function domainFromUrl(raw: string): string | null {
  try {
    const value = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function screenUserContent(
  rawText: string | null | undefined,
  options: { context: ContentScreenContext; config?: ContentScreenConfig },
): ContentScreenResult {
  const text = (rawText ?? "").trim();
  if (!text) return { ok: true };

  const config = options.config ?? {};
  const lowercase = text.toLowerCase();

  for (const keyword of mergedBlockedKeywords(config)) {
    if (lowercase.includes(keyword)) {
      return { ok: false, reason: "blocked_keyword", match: keyword };
    }
  }

  const urls = extractUrls(text);
  if (urls.length === 0) return { ok: true };

  const blockedDomains = mergedBlockedDomains(config);
  for (const rawUrl of urls) {
    const domain = domainFromUrl(rawUrl);
    if (!domain) continue;
    for (const blockedDomain of blockedDomains) {
      if (domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)) {
        return { ok: false, reason: "blocked_domain", match: blockedDomain };
      }
    }
  }

  const maxUrls = MAX_URLS_BY_CONTEXT[options.context];
  if (urls.length > maxUrls) return { ok: false, reason: "too_many_urls" };

  const skipDensity =
    SKIP_LINK_DENSITY_WITHIN_BUDGET.has(options.context) && urls.length <= maxUrls;
  const urlCharacters = urls.reduce((sum, url) => sum + url.length, 0);

  if (!skipDensity && text.length >= 20 && urlCharacters / text.length > 0.5) {
    return { ok: false, reason: "link_density" };
  }

  return { ok: true };
}

export function screenMultipleFields(
  fields: Array<{ text: string | null | undefined; context: ContentScreenContext }>,
  config: ContentScreenConfig = {},
): ContentScreenResult {
  for (const field of fields) {
    const result = screenUserContent(field.text, { context: field.context, config });
    if (!result.ok) return result;
  }
  return { ok: true };
}
