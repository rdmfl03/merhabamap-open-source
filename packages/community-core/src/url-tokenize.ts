export const CONTENT_SCREEN_URL_REGEX =
  /\b((?:https?:\/\/|www\.)[^\s<>"'()]+|[a-z0-9][a-z0-9-]{0,62}\.(?:com|net|org|io|ai|app|co|de|tr|ru|xyz|tk|ml|ga|cf|biz|info|top)\b(?:\/[^\s<>"'()]*)?)/gi;

export type AutolinkSegment =
  | { type: "text"; value: string }
  | { type: "url"; value: string };

export function splitTextForAutolinkDisplay(rawText: string): AutolinkSegment[] {
  const text = rawText ?? "";
  if (!text) return [{ type: "text", value: "" }];

  const segments: AutolinkSegment[] = [];
  const regex = new RegExp(CONTENT_SCREEN_URL_REGEX.source, "gi");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "url", value: match[0].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}
