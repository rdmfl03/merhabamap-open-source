export type ConsentCategory = "essential" | "analytics" | "affiliate";

export const CONSENT_CATEGORIES: readonly ConsentCategory[] = [
  "essential",
  "analytics",
  "affiliate",
] as const;

export type ConsentPreferences = Record<ConsentCategory, boolean> | null;
export type ParsedConsentPreferences = Record<ConsentCategory, boolean>;

export const DEFAULT_CONSENT: ParsedConsentPreferences = {
  essential: true,
  analytics: false,
  affiliate: false,
};

export const CONSENT_COOKIE_SCHEMA_VERSION = 2;

function isAllowedSchemaVersion(value: unknown): boolean {
  return value === 1 || value === 2;
}

export function parseConsentPreferencesPayload(
  raw: unknown,
): ParsedConsentPreferences | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const record = raw as Record<string, unknown>;
  if ("v" in record && !isAllowedSchemaVersion(record.v)) return null;
  if (typeof record.essential !== "boolean" || typeof record.analytics !== "boolean") {
    return null;
  }

  return {
    essential: true,
    analytics: record.analytics === true,
    affiliate: record.affiliate === true,
  };
}

export function serializeConsentPreferences(
  preferences: ParsedConsentPreferences,
): string {
  return JSON.stringify({
    v: CONSENT_COOKIE_SCHEMA_VERSION,
    essential: true,
    analytics: preferences.analytics === true,
    affiliate: preferences.affiliate === true,
  });
}
