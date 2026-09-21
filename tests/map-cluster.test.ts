import { describe, expect, it } from "vitest";

import {
  clusterProjectedPoints,
  germanyCityCircleSize,
  markerRenderLimitsForZoom,
  type ProjectedPoint,
} from "../packages/shared/src/map/index";

describe("shared map primitives", () => {
  it("clusters nearby points while preserving their items", () => {
    const points: ProjectedPoint<{ id: string }>[] = [
      { id: "a", kind: "place", item: { id: "a" }, latitude: 51.7, longitude: 8.7, screen: { x: 10, y: 10 } },
      { id: "b", kind: "place", item: { id: "b" }, latitude: 51.71, longitude: 8.71, screen: { x: 15, y: 13 } },
    ];

    const result = clusterProjectedPoints(points, 13, null);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ type: "cluster", count: 2, ids: ["a", "b"] });
  });

  it("keeps a selected point outside a cluster", () => {
    const points: ProjectedPoint<{ id: string }>[] = [
      { id: "a", kind: "event", item: { id: "a" }, latitude: 51.7, longitude: 8.7, screen: { x: 10, y: 10 } },
      { id: "b", kind: "event", item: { id: "b" }, latitude: 51.71, longitude: 8.71, screen: { x: 12, y: 12 } },
    ];

    expect(clusterProjectedPoints(points, 13, "a")).toEqual([
      { type: "point", item: { id: "a" }, screen: { x: 10, y: 10 } },
      { type: "point", item: { id: "b" }, screen: { x: 12, y: 12 } },
    ]);
  });

  it("uses bounded render budgets and marker sizes", () => {
    expect(markerRenderLimitsForZoom(10)).toEqual({ places: 80, events: 20 });
    expect(germanyCityCircleSize(9999)).toBeLessThanOrEqual(44);
  });
});
