import { motion } from "framer-motion";
import { useStore } from "../store";
import { zonePhoto } from "../photos";
import type { Hotspot, Furniture, HotspotKind } from "@beachclub/shared/types";

export type OpenPin =
  | { type: "hotspot"; data: Hotspot }
  | { type: "furniture"; data: Furniture }
  | null;

const KIND_LABEL: Record<HotspotKind, string> = {
  entry: "Entrée",
  bar: "Bar",
  restaurant: "Restaurant",
  pool: "Piscine",
  boutique: "Boutique",
  stage: "Scène",
  zone: "Zone gratuite",
};

const KIND_BLURB: Record<HotspotKind, string> = {
  entry: "Accès au club. Coupe-file disponible.",
  bar: "Cocktails signature et ambiance DJ.",
  restaurant: "Cuisine du monde, pieds dans le sable.",
  pool: "Baignade et transats au bord de l'eau.",
  boutique: "Mode et accessoires de plage.",
  stage: "Lives et DJ sets au coucher du soleil.",
  zone: "Accès libre, sans réservation.",
};

export function PinCard({ open, onClose }: { open: OpenPin; onClose: () => void }) {
  const venue = useStore((s) => s.venue);
  const reservedIds = useStore((s) => s.reservedIds);
  const selectFurniture = useStore((s) => s.selectFurniture);
  const setStep = useStore((s) => s.setStep);
  if (!open) return null;

  const zoneOf = (id?: string) => venue?.zones.find((z) => z.id === id);

  let photo: string;
  let title: string;
  let subtitle: string;
  let blurb: string;
  let action: { label: string; onClick: () => void; disabled?: boolean } | null = null;

  if (open.type === "hotspot") {
    const h = open.data;
    photo = zonePhoto(h.zoneId);
    title = h.label;
    subtitle = KIND_LABEL[h.kind];
    blurb = zoneOf(h.zoneId)?.blurb ?? KIND_BLURB[h.kind];
    if (h.zoneId) {
      action = {
        label: "Réserver dans cette zone →",
        onClick: () => {
          setStep(1);
          onClose();
        },
      };
    }
  } else {
    const f = open.data;
    const reserved = reservedIds.has(f.id);
    photo = zonePhoto(f.zoneId);
    title = f.label;
    subtitle = `${zoneOf(f.zoneId)?.name ?? ""} · ${f.capacity} pers · ${f.priceChf}.-`;
    blurb = reserved ? "Cet emplacement est déjà réservé." : zoneOf(f.zoneId)?.blurb ?? "";
    action = {
      label: reserved ? "Déjà réservé" : "Réserver cet emplacement →",
      disabled: reserved,
      onClick: () => {
        selectFurniture(f.id);
        setStep(2);
        onClose();
      },
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="glass pointer-events-auto w-64 overflow-hidden rounded-3xl"
    >
      <div className="relative h-32 w-full">
        <img src={photo} alt={title} className="h-full w-full object-cover" />
        <button onClick={onClose} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white">
          ✕
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-display text-xl leading-tight">{title}</h3>
        <p className="text-[11px] uppercase tracking-wide text-white/60">{subtitle}</p>
        <p className="mt-2 text-sm text-white/80">{blurb}</p>
        {action && (
          <button
            onClick={action.onClick}
            disabled={action.disabled}
            className="mt-3 w-full rounded-full bg-sunset py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
