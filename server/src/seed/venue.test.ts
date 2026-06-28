import { test, expect } from "vitest";
import { VENUE } from "./venue";
import { CLUB } from "./club";

test("venue has zones, furniture, hotspots and add-ons", () => {
  expect(VENUE.zones.length).toBeGreaterThanOrEqual(4);
  expect(VENUE.furniture.length).toBeGreaterThanOrEqual(16);
  expect(VENUE.hotspots.length).toBeGreaterThanOrEqual(12);
  expect(VENUE.addons.some((a) => a.category === "bottle")).toBe(true);
});

test("furniture ids are unique, priced, and positioned in percent", () => {
  const ids = new Set(VENUE.furniture.map((f) => f.id));
  expect(ids.size).toBe(VENUE.furniture.length);
  for (const f of VENUE.furniture) {
    expect(f.priceChf).toBeGreaterThan(0);
    expect(f.x).toBeGreaterThanOrEqual(0);
    expect(f.x).toBeLessThanOrEqual(100);
    expect(f.y).toBeGreaterThanOrEqual(0);
    expect(f.y).toBeLessThanOrEqual(100);
  }
});

test("every furniture references a real zone", () => {
  const zoneIds = new Set(VENUE.zones.map((z) => z.id));
  expect(VENUE.furniture.every((f) => zoneIds.has(f.zoneId))).toBe(true);
});

test("CLUB is derived from venue furniture (reservation validation)", () => {
  expect(CLUB.length).toBe(VENUE.furniture.length);
  expect(new Set(CLUB.map((d) => d.id)).size).toBe(CLUB.length);
});
