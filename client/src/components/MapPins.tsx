import { useState } from "react";
import { useStore } from "../store";
import type { Hotspot, Furniture, HotspotKind } from "@beachclub/shared/types";
import type { OpenPin } from "./PinCard";

const KIND_ICON: Record<HotspotKind, string> = {
  entry: "🚪",
  bar: "🍸",
  restaurant: "🍽️",
  pool: "🏊",
  boutique: "🛍️",
  stage: "🎤",
  zone: "✦",
};

function HotspotPin({ h, onOpen }: { h: Hotspot; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${h.x}%`, top: `${h.y}%` }}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm shadow-md ring-1 ring-black/10">
        {KIND_ICON[h.kind]}
      </span>
      <span
        className={`absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-full bg-dusk/90 px-2 py-0.5 text-[11px] text-white transition ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {h.label}
      </span>
    </button>
  );
}

function FurniturePin({
  f,
  reserved,
  selected,
  active,
  onSelect,
}: {
  f: Furniture;
  reserved: boolean;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const color = reserved ? "#7a7f87" : selected ? "#ff7a59" : "#1fb6b0";
  return (
    <button
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition"
      style={{ left: `${f.x}%`, top: `${f.y}%`, opacity: active || selected ? 1 : 0.55 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!reserved) onSelect();
      }}
      title={reserved ? `${f.label} · réservé` : `${f.label} · ${f.priceChf}.-`}
    >
      <span
        className="block rounded-full ring-2 ring-white/70 shadow"
        style={{
          width: active || selected ? 18 : 12,
          height: active || selected ? 18 : 12,
          background: color,
          cursor: reserved ? "not-allowed" : "pointer",
        }}
      />
      {(active || selected) && (
        <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-dusk/90 px-2 py-0.5 text-[10px] text-white">
          {f.label} · {reserved ? "réservé" : `${f.priceChf}.-`}
        </span>
      )}
    </button>
  );
}

export function MapPins({
  focusZone,
  onOpen,
}: {
  focusZone: string | null;
  onOpen: (p: OpenPin) => void;
}) {
  const venue = useStore((s) => s.venue);
  const reservedIds = useStore((s) => s.reservedIds);
  const step = useStore((s) => s.step);
  const furnitureId = useStore((s) => s.furnitureId);
  if (!venue) return null;

  // Furniture pins are emphasised on the furniture step (1).
  const furnitureActive = step === 1;

  return (
    <>
      {venue.hotspots.map((h) => (
        <HotspotPin key={h.id} h={h} onOpen={() => onOpen({ type: "hotspot", data: h })} />
      ))}
      {venue.furniture.map((f) => {
        const zoneFocused = !focusZone || f.zoneId === focusZone;
        return (
          <FurniturePin
            key={f.id}
            f={f}
            reserved={reservedIds.has(f.id)}
            selected={furnitureId === f.id}
            active={furnitureActive && zoneFocused}
            onSelect={() => onOpen({ type: "furniture", data: f })}
          />
        );
      })}
    </>
  );
}
