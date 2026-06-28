import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MenuGrid } from "../components/MenuGrid";
import { Cart } from "../components/Cart";
import { ChatPanel } from "../components/ChatPanel";
import { MicButton } from "../components/MicButton";

export function Daybed() {
  const { id } = useParams();
  const daybedId = id ?? "inconnu";
  const [fallback, setFallback] = useState(false);

  return (
    <div className="mx-auto min-h-full max-w-md px-4 pb-28 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60">Daybed</p>
          <h1 className="font-display text-3xl">{daybedId}</h1>
        </div>
        <Link to="/" className="text-sm text-white/60">
          ← plan
        </Link>
      </header>

      <AnimatePresence>
        {fallback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass mb-4 rounded-2xl border-l-4 border-sunset px-4 py-3 text-sm"
          >
            🎙 Micro indisponible — tapez votre commande ou utilisez la carte ci-dessous.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <ChatPanel daybedId={daybedId} />
        <Cart daybedId={daybedId} />
        <MenuGrid />
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <MicButton daybedId={daybedId} onFallback={() => setFallback(true)} />
      </div>
    </div>
  );
}
