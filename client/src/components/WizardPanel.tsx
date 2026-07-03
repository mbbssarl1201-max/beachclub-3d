import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore, linesTotal, promoDiscount, type Step } from "../store";
import type { AddOn } from "@beachclub/shared/types";

function next14Days(): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const base = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    // Build the ISO date from LOCAL components — toISOString() would shift to UTC
    // and roll the date back a day in positive-offset timezones (CH summer = +2).
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({
      iso,
      label: d.toLocaleDateString("fr-CH", { weekday: "short", day: "2-digit", month: "short" }),
    });
  }
  return out;
}

const CAT_LABEL: Record<AddOn["category"], string> = {
  cocktail: "Cocktails",
  food: "À manger",
  soft: "Soft",
  bottle: "Bouteilles",
};

export function WizardPanel({
  focusZone,
  setFocusZone,
}: {
  focusZone: string | null;
  setFocusZone: (z: string | null) => void;
}) {
  const s = useStore();
  const navigate = useNavigate();
  const days = useMemo(next14Days, []);
  const [confirming, setConfirming] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const venue = s.venue;
  const furniture = venue?.furniture.find((f) => f.id === s.furnitureId) ?? null;
  const subtotal = (furniture?.priceChf ?? 0) + linesTotal(s.addons);
  const discount = promoDiscount(s.promo, subtotal);
  const total = subtotal - discount;

  const go = (step: Step) => s.setStep(step);

  const confirm = async () => {
    if (!furniture || !s.date) return;
    setConfirming(true);
    setErr(null);
    try {
      const r = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ daybedId: furniture.id, name: s.guestName || "Invité" }),
      });
      if (r.status === 409) {
        setErr("Cet emplacement vient d'être réservé. Choisissez-en un autre.");
        setConfirming(false);
        go(1);
        return;
      }
      if (s.addons.length > 0) {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ daybedId: furniture.id, lines: s.addons }),
        });
      }
      setRef(`LAG-${furniture.id.toUpperCase()}-${s.date.replace(/-/g, "").slice(4)}`);
    } catch {
      setErr("Paiement impossible (réseau).");
    }
    setConfirming(false);
  };

  if (!venue) return null;

  // success screen
  if (ref) {
    return (
      <Panel>
        <div className="text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="font-display mt-3 text-2xl">Réservation confirmée</h2>
          <p className="mt-1 text-white/75">
            {furniture?.label} · {s.date} · {s.session === "sunset" ? "Sunset" : "Journée"}
          </p>
          <p className="mt-2 text-sm text-white/60">Référence {ref}</p>
          <p className="mt-1 font-semibold">{total}.- CHF payés</p>
          <button
            onClick={() => navigate(`/d/${furniture?.id}`)}
            className="mt-5 w-full rounded-full bg-sunset py-3 font-semibold"
          >
            Commander au transat (voix / chat) →
          </button>
          <button
            onClick={() => { setRef(null); s.resetBooking(); }}
            className="mt-2 w-full rounded-full py-2 text-white/60"
          >
            Nouvelle réservation
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      {/* Step 0 — Date */}
      {s.step === 0 && (
        <>
          <h2 className="font-display text-2xl">Choisissez votre date</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {days.map((d) => (
              <button
                key={d.iso}
                onClick={() => s.setDate(d.iso)}
                className={`rounded-xl px-2 py-2 text-xs capitalize ${s.date === d.iso ? "bg-sunset font-semibold" : "bg-white/10"}`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/70">Session</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => s.setSession("day")} className={`rounded-xl py-3 ${s.session === "day" ? "bg-lagoon font-semibold" : "bg-white/10"}`}>☀️ Journée</button>
            <button onClick={() => s.setSession("sunset")} className={`rounded-xl py-3 ${s.session === "sunset" ? "bg-sunset font-semibold" : "bg-white/10"}`}>🌅 Sunset</button>
          </div>
          <NextBtn disabled={!s.date || !s.session} onClick={() => go(1)}>Choisir l'emplacement →</NextBtn>
        </>
      )}

      {/* Step 1 — Furniture */}
      {s.step === 1 && (
        <>
          <h2 className="font-display text-2xl">Votre emplacement</h2>
          <p className="mt-1 text-sm text-white/70">Cliquez un point sur le plan, ou choisissez ci-dessous.</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {venue.zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setFocusZone(focusZone === z.id ? null : z.id)}
                className={`rounded-full px-2 py-1 text-[11px] ${focusZone === z.id ? "bg-sunset" : "bg-white/10"}`}
              >
                {z.name}
              </button>
            ))}
          </div>
          <div className="mt-3 max-h-52 space-y-1 overflow-y-auto pr-1">
            {venue.furniture
              .filter((f) => !focusZone || f.zoneId === focusZone)
              .map((f) => {
                const reserved = s.reservedIds.has(f.id);
                return (
                  <button
                    key={f.id}
                    disabled={reserved}
                    onClick={() => s.selectFurniture(f.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm disabled:opacity-40 ${s.furnitureId === f.id ? "bg-sunset" : "bg-white/8"}`}
                  >
                    <span>{f.label} <span className="text-white/50">· {f.type.replace("_", " ")}</span></span>
                    <span>{reserved ? "réservé" : `${f.priceChf}.-`}</span>
                  </button>
                );
              })}
          </div>
          <div className="mt-3 flex gap-2">
            <BackBtn onClick={() => go(0)} />
            <NextBtn disabled={!s.furnitureId} onClick={() => go(2)}>Ajouter des extras →</NextBtn>
          </div>
        </>
      )}

      {/* Step 2 — Add-ons */}
      {s.step === 2 && (
        <>
          <h2 className="font-display text-2xl">Extras &amp; bouteilles</h2>
          <div className="mt-3 max-h-60 space-y-4 overflow-y-auto pr-1">
            {(["bottle", "cocktail", "food", "soft"] as AddOn["category"][]).map((cat) => (
              <div key={cat}>
                <h3 className="mb-1 text-sm text-white/80">{CAT_LABEL[cat]}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {venue.addons.filter((a) => a.category === cat).map((a) => {
                    const line = s.addons.find((l) => l.itemId === a.id);
                    return (
                      <div key={a.id} className="rounded-xl bg-white/8 p-2 text-xs">
                        <div className="flex justify-between"><span>{a.name}</span><span className="text-white/60">{a.priceChf}.-</span></div>
                        <div className="mt-1 flex items-center justify-between">
                          <button onClick={() => s.removeAddon(a.id)} aria-label={`Retirer ${a.name}`} className="h-6 w-6 rounded-full bg-white/10">−</button>
                          <span>{line?.qty ?? 0}</span>
                          <button onClick={() => s.addAddon(a)} aria-label={`Ajouter ${a.name}`} className="h-6 w-6 rounded-full bg-lagoon">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <BackBtn onClick={() => go(1)} />
            <NextBtn onClick={() => go(3)}>Récapitulatif →</NextBtn>
          </div>
        </>
      )}

      {/* Step 3 — Review */}
      {s.step === 3 && (
        <>
          <h2 className="font-display text-2xl">Récapitulatif</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row k="Date" v={`${s.date} · ${s.session === "sunset" ? "Sunset" : "Journée"}`} />
            <Row k="Emplacement" v={`${furniture?.label} (${furniture?.priceChf}.-)`} />
            {s.addons.map((l) => <Row key={l.itemId} k={`${l.qty}× ${l.name}`} v={`${l.qty * l.priceChf}.-`} />)}
            {s.promo && discount > 0 && <Row k={`Promo ${s.promo}`} v={`−${discount}.-`} />}
            <div className="flex justify-between border-t border-white/15 pt-2 font-semibold">
              <span>Total</span><span>{total}.- CHF</span>
            </div>
          </div>
          <input
            value={s.guestName}
            onChange={(e) => s.setGuestName(e.target.value)}
            placeholder="Votre nom"
            className="mt-3 w-full rounded-full bg-white/15 px-4 py-2 text-sm outline-none"
          />
          <div className="mt-3 flex gap-2">
            <BackBtn onClick={() => go(2)} />
            <NextBtn onClick={() => go(4)}>Paiement →</NextBtn>
          </div>
        </>
      )}

      {/* Step 4 — Confirm / pay */}
      {s.step === 4 && (
        <>
          <h2 className="font-display text-2xl">Paiement</h2>
          <p className="mt-1 text-sm text-white/70">Démo — aucun débit réel.</p>
          <div className="mt-3 rounded-2xl bg-white/8 p-3 text-sm">
            <Row k="À payer" v={`${total}.- CHF`} />
            <div className="mt-2 grid grid-cols-3 gap-2">
              <span className="rounded-lg bg-white/10 py-2 text-center text-xs">💳 Carte</span>
              <span className="rounded-lg bg-white/10 py-2 text-center text-xs">📱 TWINT</span>
              <span className="rounded-lg bg-white/10 py-2 text-center text-xs"> Pay</span>
            </div>
          </div>
          {err && <p className="mt-2 text-sm text-sunset">{err}</p>}
          <div className="mt-3 flex gap-2">
            <BackBtn onClick={() => go(3)} />
            <button onClick={confirm} disabled={confirming} className="flex-1 rounded-full bg-sunset py-3 font-semibold disabled:opacity-50">
              {confirming ? "Paiement…" : `Payer ${total}.- et confirmer`}
            </button>
          </div>
        </>
      )}
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass pointer-events-auto w-[20rem] max-w-[88vw] rounded-3xl p-5"
    >
      {children}
    </motion.div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-white/75">{k}</span><span>{v}</span></div>;
}
function NextBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="mt-4 flex-1 rounded-full bg-sunset py-3 font-semibold disabled:opacity-40">{children}</button>;
}
function BackBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} aria-label="Étape précédente" className="mt-4 rounded-full bg-white/10 px-4 py-3 text-sm">←</button>;
}
