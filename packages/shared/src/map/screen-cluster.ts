/**
 * PORTABLE — greedy screen-space clustering algorithm, no DOM dependencies.
 *
 * Takes projected pixel positions and merges nearby points of the same kind
 * into clusters. The selected item is always kept as a singleton.
 */

import type { MapMarkerKind, ScreenPosition } from "./map-item-types";
import { cityClusterRadiusForZoom } from "./cluster-format";

// ---------------------------------------------------------------------------
// Input / output types
// ---------------------------------------------------------------------------

export type ProjectedPoint<T> = {
  item: T;
  kind: MapMarkerKind;
  id: string;
  latitude: number;
  longitude: number;
  screen: ScreenPosition;
};

export type ClusteredResult<T> =
  | { type: "point"; item: T; screen: ScreenPosition }
  | {
      type: "cluster";
      kind: MapMarkerKind;
      count: number;
      screen: ScreenPosition;
      latitude: number;
      longitude: number;
      ids: string[];
      items: T[];
    };

// ---------------------------------------------------------------------------
// Algorithm
// ---------------------------------------------------------------------------

export function clusterProjectedPoints<T>(
  projectedPoints: ProjectedPoint<T>[],
  zoom: number | null,
  selectedId: string | null,
): ClusteredResult<T>[] {
  // Single-pass partition: split into selected-singles, place-kind, event-kind
  // in one walk instead of three filter() passes.
  const results: ClusteredResult<T>[] = [];
  const placePoints: ProjectedPoint<T>[] = [];
  const eventPoints: ProjectedPoint<T>[] = [];
  const meetupPoints: ProjectedPoint<T>[] = [];
  const cinemaPoints: ProjectedPoint<T>[] = [];

  for (const p of projectedPoints) {
    if (p.id === selectedId) {
      results.push({ type: "point", item: p.item, screen: p.screen });
      continue;
    }
    if (p.kind === "event") {
      eventPoints.push(p);
    } else if (p.kind === "meetup") {
      meetupPoints.push(p);
    } else if (p.kind === "cinema") {
      cinemaPoints.push(p);
    } else {
      placePoints.push(p);
    }
  }

  const buildKind = (kind: MapMarkerKind, pointsOfKind: ProjectedPoint<T>[]) => {
    const radius = cityClusterRadiusForZoom(kind, zoom);
    const radiusSq = radius * radius;

    /**
     * Spatial-hash grid indexes buckets by screen-space cells of side
     * `radius`. Any bucket whose center could match a new point at (x,y)
     * must live in one of the 9 cells surrounding floor(x/r), floor(y/r);
     * cells further away are geometrically out of reach. That turns bucket
     * lookup from O(buckets) per point into O(1) amortised.
     *
     * Correctness note: The original linear algorithm selects the first
     * match by insertion order (`Array.find`). We preserve that by
     * scanning the 3×3 neighbourhood, collecting candidates, and picking
     * the one with the smallest bucket index. When a bucket's center
     * drifts into a new cell (running-mean update), we re-insert it so
     * the 3×3 search is still complete for subsequent points.
     */
    type Bucket = {
      entries: ProjectedPoint<T>[];
      sumX: number;
      sumY: number;
      latSum: number;
      lngSum: number;
      cellX: number;
      cellY: number;
    };

    const buckets: Bucket[] = [];
    const grid = new Map<string, number[]>();
    const cellKey = (cx: number, cy: number) => `${cx}|${cy}`;

    const putInCell = (cx: number, cy: number, idx: number) => {
      const key = cellKey(cx, cy);
      const cell = grid.get(key);
      if (cell) cell.push(idx);
      else grid.set(key, [idx]);
    };

    const removeFromCell = (cx: number, cy: number, idx: number) => {
      const key = cellKey(cx, cy);
      const cell = grid.get(key);
      if (!cell) return;
      const pos = cell.indexOf(idx);
      if (pos >= 0) cell.splice(pos, 1);
      if (cell.length === 0) grid.delete(key);
    };

    for (const entry of pointsOfKind) {
      const ex = entry.screen.x;
      const ey = entry.screen.y;
      const cx = Math.floor(ex / radius);
      const cy = Math.floor(ey / radius);

      // Scan 3×3 neighbourhood, keep the match with the smallest bucket
      // index so we reproduce `Array.find`'s first-match-by-insertion-order
      // semantics from the previous linear implementation.
      let matchIdx = -1;
      for (let ny = cy - 1; ny <= cy + 1; ny++) {
        for (let nx = cx - 1; nx <= cx + 1; nx++) {
          const cell = grid.get(cellKey(nx, ny));
          if (!cell) continue;
          for (const idx of cell) {
            if (matchIdx !== -1 && idx >= matchIdx) continue;
            const b = buckets[idx];
            const n = b.entries.length;
            const bcx = b.sumX / n;
            const bcy = b.sumY / n;
            const dx = bcx - ex;
            const dy = bcy - ey;
            if (dx * dx + dy * dy <= radiusSq) {
              matchIdx = idx;
            }
          }
        }
      }

      if (matchIdx === -1) {
        const newIdx = buckets.length;
        buckets.push({
          entries: [entry],
          sumX: ex,
          sumY: ey,
          latSum: entry.latitude,
          lngSum: entry.longitude,
          cellX: cx,
          cellY: cy,
        });
        putInCell(cx, cy, newIdx);
        continue;
      }

      const bucket = buckets[matchIdx];
      bucket.entries.push(entry);
      bucket.sumX += ex;
      bucket.sumY += ey;
      bucket.latSum += entry.latitude;
      bucket.lngSum += entry.longitude;

      // Re-bucket if the running mean drifted into a different cell.
      // Keeps the 3×3 invariant so the next point's search is complete.
      const n = bucket.entries.length;
      const newCellX = Math.floor(bucket.sumX / n / radius);
      const newCellY = Math.floor(bucket.sumY / n / radius);
      if (newCellX !== bucket.cellX || newCellY !== bucket.cellY) {
        removeFromCell(bucket.cellX, bucket.cellY, matchIdx);
        putInCell(newCellX, newCellY, matchIdx);
        bucket.cellX = newCellX;
        bucket.cellY = newCellY;
      }
    }

    for (const bucket of buckets) {
      const n = bucket.entries.length;
      if (n === 1) {
        results.push({
          type: "point",
          item: bucket.entries[0].item,
          screen: bucket.entries[0].screen,
        });
        continue;
      }

      const ids: string[] = new Array(n);
      const items: T[] = new Array(n);
      for (let i = 0; i < n; i++) {
        ids[i] = bucket.entries[i].id;
        items[i] = bucket.entries[i].item;
      }

      results.push({
        type: "cluster",
        kind,
        count: n,
        screen: { x: bucket.sumX / n, y: bucket.sumY / n },
        latitude: bucket.latSum / n,
        longitude: bucket.lngSum / n,
        ids,
        items,
      });
    }
  };

  buildKind("place", placePoints);
  buildKind("event", eventPoints);
  buildKind("meetup", meetupPoints);
  buildKind("cinema", cinemaPoints);

  return results;
}
