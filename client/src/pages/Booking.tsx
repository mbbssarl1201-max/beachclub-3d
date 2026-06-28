import { useEffect, useState } from "react";
import { AerialMap } from "../components/AerialMap";
import { MapPins } from "../components/MapPins";
import { Stepper } from "../components/Stepper";
import { WizardPanel } from "../components/WizardPanel";
import { LeftRail } from "../components/LeftRail";
import { Topbar } from "../components/Topbar";
import { ZoneTabs } from "../components/ZoneTabs";
import { CartDrawer } from "../components/CartDrawer";
import { useStore } from "../store";
import { fetchInitial } from "../ws";
import type { Venue } from "@beachclub/shared/types";

export function Booking() {
  const setVenue = useStore((s) => s.setVenue);
  const step = useStore((s) => s.step);
  const setStep = useStore((s) => s.setStep);
  const [focusZone, setFocusZone] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch("/api/venue").then((r) => r.json()).then((v: Venue) => setVenue(v));
    fetchInitial();
  }, [setVenue]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AerialMap>
        <MapPins focusZone={focusZone} />
      </AerialMap>

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

      {/* wizard panel (right) */}
      <div className="absolute right-4 top-28 z-20 max-h-[70vh]">
        <WizardPanel focusZone={focusZone} setFocusZone={setFocusZone} />
      </div>

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
