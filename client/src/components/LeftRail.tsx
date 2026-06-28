import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store";

type Panel = "queue" | "promo" | "free" | null;

export function LeftRail() {
  const [panel, setPanel] = useState<Panel>(null);
  const promo = useStore((s) => s.promo);
  const applyPromo = useStore((s) => s.applyPromo);
  const [code, setCode] = useState("");

  const item = (key: Exclude<Panel, null>, icon: string, label: string) => (
    <button
      onClick={() => setPanel((p) => (p === key ? null : key))}
      className={`glass flex w-16 flex-col items-center gap-1 rounded-2xl py-3 text-[10px] ${panel === key ? "ring-2 ring-sunset" : ""}`}
    >
      <span className="text-lg">{icon}</span>
      <span className="leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="pointer-events-auto flex items-start gap-3">
      <div className="flex flex-col gap-2">
        {item("queue", "⚡", "Skip The Queue")}
        {item("promo", "％", "Promotions")}
        {item("free", "👥", "Free Entry Zones")}
      </div>

      <AnimatePresence>
        {panel && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="glass w-60 rounded-2xl p-4 text-sm"
          >
            {panel === "queue" && (
              <>
                <h3 className="font-display text-lg">Skip The Queue</h3>
                <p className="mt-1 text-white/75">Entrée prioritaire coupe-file, accès direct à votre emplacement.</p>
                <p className="mt-2 font-semibold text-lagoon">+29.- par personne</p>
              </>
            )}
            {panel === "promo" && (
              <>
                <h3 className="font-display text-lg">Promotions</h3>
                <p className="mt-1 text-white/70">Codes : <b>SUNSET</b> (-15%), <b>LAGUNE10</b> (-10%)</p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code promo"
                    className="w-full rounded-full bg-white/15 px-3 py-2 text-xs uppercase outline-none"
                  />
                  <button onClick={() => applyPromo(code)} className="rounded-full bg-sunset px-3 text-xs font-semibold">OK</button>
                </div>
                {promo && <p className="mt-2 text-lagoon">✓ Code {promo} appliqué</p>}
              </>
            )}
            {panel === "free" && (
              <>
                <h3 className="font-display text-lg">Free Entry Party Zones</h3>
                <p className="mt-1 text-white/75">Accès gratuit (sans réservation) :</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-white/80">
                  <li>Dance Floor &amp; Stage</li>
                  <li>Party Zone</li>
                  <li>Beach Access</li>
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
