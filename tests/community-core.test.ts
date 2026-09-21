import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONSENT,
  parseConsentPreferencesPayload,
  screenUserContent,
  serializeConsentPreferences,
  splitTextForAutolinkDisplay,
} from "../packages/community-core/src/index";

describe("community-core consent", () => {
  it("does not infer affiliate consent from analytics consent", () => {
    expect(parseConsentPreferencesPayload({ essential: true, analytics: true })).toEqual({
      essential: true,
      analytics: true,
      affiliate: false,
    });
    expect(DEFAULT_CONSENT.affiliate).toBe(false);
  });

  it("round-trips the current schema", () => {
    const encoded = serializeConsentPreferences({
      essential: true,
      analytics: false,
      affiliate: true,
    });
    expect(parseConsentPreferencesPayload(JSON.parse(encoded))?.affiliate).toBe(true);
  });
});

describe("community-core content screening", () => {
  it("blocks known shorteners and configured domains", () => {
    expect(screenUserContent("https://bit.ly/example", { context: "comment" })).toMatchObject({
      ok: false,
      reason: "blocked_domain",
    });
    expect(
      screenUserContent("Read https://tracking.example.com/story", {
        context: "post",
        config: { blockedDomains: ["tracking.example.com"] },
      }),
    ).toMatchObject({ ok: false, reason: "blocked_domain" });
  });

  it("keeps ordinary bilingual community text", () => {
    expect(screenUserContent("Bugün Köln'de güzel bir etkinlik var.", { context: "post" })).toEqual({
      ok: true,
    });
  });

  it("tokenizes links without converting surrounding text", () => {
    expect(splitTextForAutolinkDisplay("Mehr: https://example.com fertig")).toEqual([
      { type: "text", value: "Mehr: " },
      { type: "url", value: "https://example.com" },
      { type: "text", value: " fertig" },
    ]);
  });
});
