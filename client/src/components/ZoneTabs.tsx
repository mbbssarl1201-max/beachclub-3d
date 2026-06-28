import { useStore } from "../store";

export function ZoneTabs({
  focusZone,
  setFocusZone,
}: {
  focusZone: string | null;
  setFocusZone: (z: string | null) => void;
}) {
  const venue = useStore((s) => s.venue);
  if (!venue) return null;
  return (
    <div className="pointer-events-auto flex max-w-[70vw] gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      <button
        onClick={() => setFocusZone(null)}
        className={`glass whitespace-nowrap rounded-full px-3 py-2 text-xs ${focusZone === null ? "ring-2 ring-sunset" : ""}`}
      >
        Tout le club
      </button>
      {venue.zones.map((z) => (
        <button
          key={z.id}
          onClick={() => setFocusZone(z.id)}
          className={`glass whitespace-nowrap rounded-full px-3 py-2 text-xs ${focusZone === z.id ? "ring-2 ring-sunset" : ""}`}
        >
          {z.name}
        </button>
      ))}
    </div>
  );
}
