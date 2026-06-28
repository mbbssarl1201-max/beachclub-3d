import type { Daybed, DaybedType } from "@beachclub/shared/types";
import { VENUE } from "./venue";

// CLUB is derived from the venue furniture — single source of truth for bookable
// units. Kept in the legacy Daybed shape so reservation validation and tests work.
const TYPE_MAP: Record<string, DaybedType> = {
  cabana: "cabana",
  vip_cabana: "cabana",
  daybed: "daybed",
  platform: "daybed",
  sunbed: "sunbed",
};

export const CLUB: Daybed[] = VENUE.furniture.map((f) => ({
  id: f.id,
  label: f.label,
  type: TYPE_MAP[f.type] ?? "daybed",
  x: f.x,
  z: f.y,
  capacity: f.capacity,
}));
