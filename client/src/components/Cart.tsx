import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, linesTotal } from "../store";

export function Cart({ daybedId }: { daybedId: string }) {
  const cart = useStore((s) => s.cart);
  const removeLine = useStore((s) => s.removeLine);
  const clearCart = useStore((s) => s.clearCart);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = async () => {
    if (cart.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ daybedId, lines: cart }),
      });
      if (res.status === 201) {
        clearCart();
        setSent(true);
        setTimeout(() => setSent(false), 3500);
      } else {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Commande refusée, réessayez.");
      }
    } catch {
      setError("Réseau indisponible — commande non envoyée.");
    }
    setBusy(false);
  };

  return (
    <div className="glass rounded-3xl p-4">
      <h3 className="font-display text-lg">Votre commande</h3>
      <AnimatePresence>
        {sent && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-lagoon mt-1 text-sm"
          >
            ✓ Envoyée au bar !
          </motion.p>
        )}
      </AnimatePresence>
      {error && <p className="mt-1 text-sm text-sunset">{error}</p>}

      <div className="mt-3 space-y-2">
        {cart.length === 0 && <p className="text-sm text-white/50">Panier vide.</p>}
        <AnimatePresence>
          {cart.map((l) => (
            <motion.div
              key={l.itemId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {l.qty}× {l.name}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-white/70">{l.qty * l.priceChf}.-</span>
                <button onClick={() => removeLine(l.itemId)} aria-label={`Retirer ${l.name}`} className="text-sunset">
                  ✕
                </button>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <>
          <div className="mt-3 flex justify-between border-t border-white/15 pt-3 font-semibold">
            <span>Total</span>
            <span>{linesTotal(cart)}.-</span>
          </div>
          <button
            onClick={order}
            disabled={busy}
            className="mt-3 w-full rounded-full bg-sunset py-3 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "…" : "Commander"}
          </button>
        </>
      )}
    </div>
  );
}
