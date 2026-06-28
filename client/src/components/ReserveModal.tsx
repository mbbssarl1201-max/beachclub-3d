import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { Daybed } from "@beachclub/shared/types";

export function ReserveModal({ daybed, onClose }: { daybed: Daybed; onClose: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const reserve = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ daybedId: daybed.id, name: name || "Invité" }),
    });
    setBusy(false);
    if (res.status === 201) setDone(true);
    else if (res.status === 409) setError("Ce daybed vient d'être réservé.");
    else setError("Réservation impossible.");
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass w-full max-w-sm rounded-3xl p-6"
      >
        <h2 className="font-display text-2xl">{daybed.label}</h2>
        <p className="mt-1 text-sm text-white/70">
          {daybed.type} · {daybed.capacity} pers.
        </p>

        {done ? (
          <div className="mt-5">
            <p className="text-lagoon font-medium">✓ Réservé ! Scannez le QR au daybed.</p>
            <button
              onClick={() => navigate(`/d/${daybed.id}`)}
              className="mt-4 w-full rounded-full bg-sunset py-3 font-semibold text-white"
            >
              Aller au daybed (simuler le QR)
            </button>
            <button onClick={onClose} className="mt-2 w-full rounded-full py-2 text-white/60">
              Fermer
            </button>
          </div>
        ) : (
          <div className="mt-5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full rounded-full bg-white/15 px-4 py-3 placeholder-white/50 outline-none"
            />
            {error && <p className="mt-2 text-sm text-sunset">{error}</p>}
            <button
              onClick={reserve}
              disabled={busy}
              className="mt-4 w-full rounded-full bg-lagoon py-3 font-semibold text-white disabled:opacity-50"
            >
              {busy ? "…" : "Réserver"}
            </button>
            <button onClick={onClose} className="mt-2 w-full rounded-full py-2 text-white/60">
              Annuler
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
