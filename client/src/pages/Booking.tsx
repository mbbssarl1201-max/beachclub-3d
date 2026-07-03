import { useEffect, useState } from "react";
import { AerialMap } from "../components/AerialMap";
import { MapPins } from "../components/MapPins";
import { Stepper } from "../components/Stepper";
import { WizardPanel } from "../components/WizardPanel";
import { LeftRail } from "../components/LeftRail";
import { Topbar } from "../components/Topbar";
import { ZoneTabs } from "../components/ZoneTabs";
import { CartDrawer } from "../components/CartDrawer";
import { PinCard, type OpenPin } from "../components/PinCard";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store";
import { fetchInitial } from "../ws";
import type { Venue } from "@beachclub/shared/types";

export function Booking() {
  const venue = useStore((s) => s.venue);
  const setVenue = useStore((s) => s.setVenue);
  const step = useStore((s) => s.step);
  const setStep = useStore((s) => s.setStep);
  const [focusZone, setFocusZone] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [openPin, setOpenPin] = useState<OpenPin>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = () => {
    setLoadError(false);
    fetch("/api/venue")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((v: Venue) => setVenue(v))
      .catch(() => setLoadError(true));
    fetchInitial();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [setVenue]);

  // Selecting a pin advances the wizard — make sure the panel is visible for it.
  useEffect(() => {
    if (step > 0) setPanelOpen(true);
  }, [step]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AerialMap>
        <MapPins focusZone={focusZone} onOpen={setOpenPin} />
      </AerialMap>

      {/* loading / error overlay while the venue isn't available */}
      {!venue && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="glass rounded-3xl px-6 py-5 text-center">
            {loadError ? (
              <>
                <p className="text-sm">Impossible de charger le plan du club.</p>
                <button onClick={load} className="mt-3 rounded-full bg-sunset px-5 py-2 text-sm font-semibold">
                  Réessayer
                </button>
              </>
            ) : (
              <p className="animate-pulse text-sm text-white/80">Chargement du club…</p>
            )}
          </div>
        </div>
      )}

      {/* pin detail card (bottom-left, clear of the wizard panel) */}
      <div className="absolute bottom-20 left-4 z-30">
        <AnimatePresence>
          {openPin && <PinCard open={openPin} onClose={() => setOpenPin(null)} />}
        </AnimatePresence>
      </div>

      {/* top bar: logo + stepper + cart/account */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto">
          <h1 className="font-display text-3xl leading-none drop-shadow">Lagune</h1>
          <p className="text-[11px] text-white/70">Beach Club · Réservation</p>
        </div>
        <div className="hidden flex-1 justify-center md:flex">
          <Stepper />
        </div>
        <Topbar onOpenCart={() => setCartOpen(true)} />
      </div>

      {/* mobile stepper */}
      <div className="absolute inset-x-0 top-16 z-20 flex justify-center px-4 md:hidden">
        <Stepper />
      </div>

      {/* left rail */}
      <div className="absolute left-4 top-28 z-20">
        <LeftRail />
      </div>

      {/* wizard panel (right) — collapsible so right-side map pins stay reachable */}
      <AnimatePresence initial={false}>
        {panelOpen ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="absolute right-4 top-28 z-20 max-h-[70vh]"
          >
            <button
              onClick={() => setPanelOpen(false)}
              title="Réduire le panneau"
              aria-label="Réduire le panneau de réservation"
              className="glass pointer-events-auto absolute -left-3 top-3 z-30 flex h-7 w-7 items-center justify-center rounded-full text-sm"
            >
              ›
            </button>
            <WizardPanel focusZone={focusZone} setFocusZone={setFocusZone} />
          </motion.div>
        ) : (
          <motion.button
            key="tab"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            onClick={() => setPanelOpen(true)}
            className="glass pointer-events-auto absolute right-4 top-28 z-20 flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-sm font-semibold"
          >
            ‹ <span>Réservation</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* bottom: zone tabs + book now */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-4">
        <ZoneTabs focusZone={focusZone} setFocusZone={setFocusZone} />
        <button
          onClick={() => setStep(step === 0 ? 0 : step)}
          className="glass pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm"
        >
          <span className="hidden sm:inline">Commencez votre réservation</span>
          <span className="rounded-full bg-sunset px-4 py-2 font-semibold">Book Now</span>
        </button>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
