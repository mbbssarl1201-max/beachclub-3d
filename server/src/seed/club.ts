import type { Daybed } from "@beachclub/shared/types";

// Fictional layout of "Lagune" beach club. Coordinates in meters on a top-down grid.
// Beachfront row (z negative = towards the sea), pool-side sunbeds, cabanas at the back.
export const CLUB: Daybed[] = [
  // Beachfront premium daybeds (front row, facing the sea)
  { id: "bf1", label: "Beachfront 1", type: "daybed", x: -9, z: -8, capacity: 2 },
  { id: "bf2", label: "Beachfront 2", type: "daybed", x: -3, z: -8, capacity: 2 },
  { id: "bf3", label: "Beachfront 3", type: "daybed", x: 3, z: -8, capacity: 2 },
  { id: "bf4", label: "Beachfront 4", type: "daybed", x: 9, z: -8, capacity: 2 },
  // Pool-side sunbeds (left and right of the central pool)
  { id: "ps1", label: "Pool Sun 1", type: "sunbed", x: -8, z: -1, capacity: 1 },
  { id: "ps2", label: "Pool Sun 2", type: "sunbed", x: -8, z: 2, capacity: 1 },
  { id: "ps3", label: "Pool Sun 3", type: "sunbed", x: 8, z: -1, capacity: 1 },
  { id: "ps4", label: "Pool Sun 4", type: "sunbed", x: 8, z: 2, capacity: 1 },
  // Mid daybeds around the pool
  { id: "md1", label: "Lagune 1", type: "daybed", x: -4, z: 1, capacity: 2 },
  { id: "md2", label: "Lagune 2", type: "daybed", x: 0, z: 1, capacity: 2 },
  { id: "md3", label: "Lagune 3", type: "daybed", x: 4, z: 1, capacity: 2 },
  // Private cabanas (back row, premium, larger capacity)
  { id: "cb1", label: "Cabana Sunset 1", type: "cabana", x: -9, z: 8, capacity: 6 },
  { id: "cb2", label: "Cabana Sunset 2", type: "cabana", x: -3, z: 8, capacity: 6 },
  { id: "cb3", label: "Cabana Sunset 3", type: "cabana", x: 3, z: 8, capacity: 6 },
  { id: "cb4", label: "Cabana Sunset 4", type: "cabana", x: 9, z: 8, capacity: 6 },
  { id: "cb5", label: "Cabana VIP", type: "cabana", x: 0, z: 9, capacity: 8 },
];
