// Ambiance photo per zone (generated). Falls back to a generic club shot.
export const zonePhoto = (zoneId?: string): string =>
  zoneId ? `/photos/${zoneId}.jpg` : "/photos/club.jpg";
