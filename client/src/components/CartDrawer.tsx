import { AnimatePresence, motion } from "framer-motion";
import { useStore, linesTotal, promoDiscount } from "../store";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const furniture = s.venue?.furniture.find((f) => f.id === s.furnitureId) ?? null;
  const subtotal = (furniture?.priceChf ?? 0) + linesTotal(s.addons);
  const discount = promoDiscount(s.promo, subtotal);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-30 bg-black/40"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="glass fixed right-0 top-0 z-40 h-full w-80 max-w-[88vw] rounded-l-3xl p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Votre panier</h2>
              <button onClick={onClose} className="text-white/60">✕</button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              {!furniture && s.addons.length === 0 && <p className="text-white/50">Panier vide — choisissez un emplacement.</p>}
              {furniture && (
                <div className="flex justify-between"><span>{furniture.label} {s.date ? `· ${s.date}` : ""}</span><span>{furniture.priceChf}.-</span></div>
              )}
              {s.addons.map((l) => (
                <div key={l.itemId} className="flex justify-between">
                  <span>{l.qty}× {l.name}</span>
                  <span className="flex gap-2">{l.qty * l.priceChf}.- <button onClick={() => s.removeAddon(l.itemId)} className="text-sunset">✕</button></span>
                </div>
              ))}
              {s.promo && discount > 0 && <div className="flex justify-between text-lagoon"><span>Promo {s.promo}</span><span>−{discount}.-</span></div>}
            </div>

            {(furniture || s.addons.length > 0) && (
              <>
                <div className="mt-4 flex justify-between border-t border-white/15 pt-3 font-semibold">
                  <span>Total</span><span>{subtotal - discount}.- CHF</span>
                </div>
                <button onClick={() => { s.setStep(3); onClose(); }} className="mt-4 w-full rounded-full bg-sunset py-3 font-semibold">
                  Finaliser la réservation
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
