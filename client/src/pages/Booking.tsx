import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClubScene } from "../scenes/ClubScene";
import { ReserveModal } from "../components/ReserveModal";
import { useStore } from "../store";
import { fetchInitial } from "../ws";
import type { Daybed } from "@beachclub/shared/types";

export function Booking() {
  const [daybeds, setDaybeds] = useState<Daybed[]>([]);
  const [selected, setSelected] = useState<Daybed | null>(null);
  const reservedIds = useStore((s) => s.reservedIds);

  useEffect(() => {
    fetch("/api/layout")
      .then((r) => r.json())
      .then(setDaybeds);
    fetchInitial();
  }, []);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <ClubScene daybeds={daybeds} reservedIds={reservedIds} onSelect={setSelected} />
      </div>

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-6">
        <div>
          <h1 className="font-display text-4xl tracking-tight drop-shadow">Lagune</h1>
          <p className="mt-1 max-w-xs text-sm text-white/80">
            Choisissez votre transat dans le club. Tournez la vue, cliquez un emplacement libre.
          </p>
        </div>
        <Link
          to="/kds"
          className="glass pointer-events-auto rounded-full px-4 py-2 text-sm font-medium"
        >
          Écran bar / cuisine
        </Link>
      </header>

      <div className="glass pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full px-5 py-2 text-sm">
        <span className="mr-3">
          <span className="mr-1 inline-block h-3 w-3 rounded-full align-middle" style={{ background: "#1fb6b0" }} />
          libre
        </span>
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-full align-middle" style={{ background: "#7a7f87" }} />
          réservé
        </span>
      </div>

      {selected && <ReserveModal daybed={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
