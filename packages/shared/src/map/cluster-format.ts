/**
 * PORTABLE — cluster sizing / formatting math, no DOM dependencies.
 *
 * Used by web markup generators today and by native renderers later.
 *
 * Size hierarchy (largest → smallest):
 *   1. Germany state cluster  (overview / regional)
 *   2. Germany city cluster   (aggregated per city)
 *   3. City-map cluster       (screen-space, dense urban)
 *   4. Individual pins        (smallest, most precise)
 */

import type { MapMarkerKind } from "./map-item-types";

// ---------------------------------------------------------------------------
// Font size selectors (count → px)
// ---------------------------------------------------------------------------

/** Font size for city-level (screen-space) cluster counts. */
export function clusterCountFontSize(kind: MapMarkerKind, count: number): number {
  // Rauten-Formen (Event/Meetup) und kompakte Cinema-Tickets → kleinere Schrift.
  if (kind === "event" || kind === "meetup" || kind === "cinema") {
    return count >= 100 ? 9 : count >= 10 ? 10 : 11;
  }
  return count >= 100 ? 10 : count >= 10 ? 11 : 12;
}

/** Font size for Germany city cluster place count. */
export function germanyCityCountFontSize(digitCount: number): number {
  return digitCount >= 4 ? 11 : digitCount >= 3 ? 12 : 13;
}

/** Font size for Germany state cluster place count. */
export function germanyStateCountFontSize(digitCount: number): number {
  return digitCount >= 5 ? 12 : digitCount >= 4 ? 13 : 15;
}

// ---------------------------------------------------------------------------
// Circle sizing (count → px diameter)
//
// State clusters are deliberately larger than city clusters to enforce the
// visual hierarchy: state ≈ overview panel, city ≈ local pin aggregate.
// ---------------------------------------------------------------------------

/** Germany city cluster circle diameter — compact to reduce visual clutter. */
export function germanyCityCircleSize(placeCount: number): number {
  const digits = String(placeCount).length;
  return Math.max(34, Math.min(44, 30 + digits * 4));
}

/** Germany state cluster circle diameter (larger than city, but restrained). */
export function germanyStateCircleSize(placeCount: number): number {
  const digits = String(placeCount).length;
  return Math.max(50, Math.min(64, 44 + digits * 5));
}

// ---------------------------------------------------------------------------
// Label pill width (city name length → px)
// ---------------------------------------------------------------------------

/** Germany city cluster label pill width. */
export function germanyCityLabelWidth(label: string, circleSize: number): number {
  return Math.max(circleSize + 8, label.length * 6.5 + 18);
}

/** Germany state cluster label pill width — uses conservative per-char estimate
 *  to avoid overflow on long names like "Baden-Württemberg". */
export function germanyStateLabelWidth(label: string, circleSize: number): number {
  return Math.max(circleSize + 12, label.length * 6.2 + 26);
}

// ---------------------------------------------------------------------------
// Screen-space clustering parameters
// ---------------------------------------------------------------------------

/** Cluster merge radius (px) for city-level overlays at a given zoom.
 *  Radii are intentionally large at low zoom so that the map shows clear
 *  cluster groups instead of individual pins. Only at zoom >= 15 do single
 *  pins dominate. */
export function cityClusterRadiusForZoom(kind: MapMarkerKind, zoom: number | null): number {
  // Rauten-/Ticket-Formen clustern mit dem groesseren Radius.
  const compact = kind === "event" || kind === "meetup" || kind === "cinema";
  if (zoom == null) return compact ? 60 : 56;
  if (zoom < 11)   return compact ? 70 : 64;
  if (zoom < 12)   return compact ? 56 : 50;
  if (zoom < 13)   return compact ? 44 : 40;
  if (zoom < 14)   return compact ? 34 : 30;
  if (zoom < 15)   return compact ? 26 : 22;
  return compact ? 20 : 18;
}

/** Max markers to render at a given zoom (performance + UX guard).
 *  Deliberately low at overview zooms so the map communicates
 *  "zoom in to explore" instead of dumping all data at once. */
export function markerRenderLimitsForZoom(zoom: number | null): { places: number; events: number } {
  if (zoom == null || zoom < 11) return { places: 80, events: 20 };
  if (zoom < 12) return { places: 150, events: 35 };
  if (zoom < 13) return { places: 300, events: 60 };
  if (zoom < 14) return { places: 600, events: 100 };
  if (zoom < 15) return { places: 1200, events: 150 };
  return { places: 2000, events: 200 };
}

// ---------------------------------------------------------------------------
// Spiderfy parameters
// ---------------------------------------------------------------------------

/** Pixel radius for the spiderfy circle depending on member count. */
export function spiderfyRadius(count: number): number {
  return count <= 4 ? 34 : count <= 6 ? 40 : 48;
}

/** Whether a cluster should spiderfy rather than zoom-in.
 *
 *  The threshold must stay in sync with the click handler's zoom cap
 *  (`MAX_CITY_CLICK_ZOOM_IN` in `city-discovery-leaflet-map.tsx`). The
 *  handler caps zoom-in at 15 for city-scoped maps, so at zoom >= 15
 *  we MUST spiderfy on click — otherwise clicking a two-pin cluster
 *  does nothing once we hit the cap (setView to the same zoom is a
 *  no-op and the cluster stays unchanged).
 *
 *  The span check stays at ~13m (0.00012°) for the rare case where
 *  points are stacked tightly at lower zooms: there's no useful zoom
 *  level that splits them, so we spiderfy directly. */
export function shouldSpiderfyCluster(
  count: number,
  zoom: number | null,
  latSpan: number,
  lngSpan: number,
): boolean {
  if (count <= 1) return false;
  if (zoom != null && zoom >= 15) return true;
  return latSpan <= 0.00012 && lngSpan <= 0.00012;
}
