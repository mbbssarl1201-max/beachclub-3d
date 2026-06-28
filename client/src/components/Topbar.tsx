import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, linesTotal } from "../store";

export function Topbar({ onOpenCart }: { onOpenCart: () => void }) {
  const [account, setAccount] = useState(false);
  const addons = useStore((s) => s.addons);
  const furnitureId = useStore((s) => s.furnitureId);
  const itemCount = addons.reduce((n, l) => n + l.qty, 0) + (furnitureId ? 1 : 0);

  return (
    <div className="pointer-events-auto flex items-center gap-3">
      <Link to="/kds" className="glass hidden rounded-full px-4 py-2 text-sm font-medium sm:block">
        Écran bar / cuisine
      </Link>

      <button onClick={onOpenCart} className="glass relative flex h-11 w-11 items-center justify-center rounded-full text-lg">
        🛒
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sunset text-[11px] font-bold">
            {itemCount}
          </span>
        )}
      </button>

      <div className="relative">
        <button onClick={() => setAccount((a) => !a)} className="glass flex h-11 w-11 items-center justify-center rounded-full text-lg">
          👤
        </button>
        <AnimatePresence>
          {account && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="glass absolute right-0 top-13 w-52 rounded-2xl p-3 text-sm"
            >
              <p className="font-display text-base">Mon compte</p>
              <p className="mt-1 text-white/60">Invité · démo</p>
              <div className="mt-3 space-y-1">
                <button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-white/10">Mes réservations</button>
                <button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-white/10">Mes commandes</button>
                <button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-white/10">Se connecter</button>
              </div>
              {linesTotal(addons) > 0 && (
                <p className="mt-2 border-t border-white/15 pt-2 text-white/70">Panier en cours : {linesTotal(addons)}.-</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
