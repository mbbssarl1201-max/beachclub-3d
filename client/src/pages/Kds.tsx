import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { OrderCard } from "../components/OrderCard";
import { useStore } from "../store";
import { fetchInitial } from "../ws";

export function Kds() {
  const orders = useStore((s) => s.orders);

  useEffect(() => {
    fetchInitial();
  }, []);

  return (
    <div className="min-h-full p-6">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="font-display text-4xl">Bar · Cuisine</h1>
        <span className="glass rounded-full px-4 py-1 text-sm">{orders.length} commandes</span>
      </header>

      {orders.length === 0 ? (
        <p className="mt-20 text-center text-white/50">En attente de commandes…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {orders.map((o, i) => (
              <OrderCard key={o.id} order={o} fresh={i === 0} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
