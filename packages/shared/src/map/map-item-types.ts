/**
 * PORTABLE — normalised types consumed by every map layer.
 *
 * These types carry only the data a map renderer needs.
 * Rendering adapters (web, iOS, Android) consume them without coupling
 * to any specific UI framework.
 */

// ---------------------------------------------------------------------------
// Marker kind
// ---------------------------------------------------------------------------

export type MapMarkerKind = "place" | "event" | "meetup" | "cinema";

// ---------------------------------------------------------------------------
// Germany national map — city cluster (one per city)
// ---------------------------------------------------------------------------

export type GermanyCityCluster = {
  slug: string;
  label: string;
  latitude: number;
  longitude: number;
  placeCount: number;
  eventCount: number;
  meetupCount: number;
  /** Distinct published films with at least one upcoming published screening. */
  cinemaCount: number;
  stateCode: string | null;
};

// ---------------------------------------------------------------------------
// Germany national map — Bundesland aggregation
// ---------------------------------------------------------------------------

export type GermanyStateCluster = {
  stateCode: string;
  label: string;
  latitude: number;
  longitude: number;
  placeCount: number;
  eventCount: number;
  meetupCount: number;
  /** Aggregated distinct films with upcoming screenings across cities in state. */
  cinemaCount: number;
  cityCount: number;
};

// ---------------------------------------------------------------------------
// Screen-space position (pixel coordinates relative to the map container)
// ---------------------------------------------------------------------------

export type ScreenPosition = {
  x: number;
  y: number;
};

// ---------------------------------------------------------------------------
// City-level overlay items (individual point or screen-space cluster)
// ---------------------------------------------------------------------------

export type CityOverlayPoint = {
  type: "point";
  id: string;
  kind: MapMarkerKind;
  latitude: number;
  longitude: number;
  label: string;
  screen: ScreenPosition;
};

export type CityOverlayCluster = {
  type: "cluster";
  kind: MapMarkerKind;
  count: number;
  screen: ScreenPosition;
  latitude: number;
  longitude: number;
  ids: string[];
};

export type CityOverlayItem = CityOverlayPoint | CityOverlayCluster;
