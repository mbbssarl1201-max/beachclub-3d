import { motion } from "framer-motion";
import type { Order } from "@beachclub/shared/types";

export function OrderCard({ order, fresh }: { order: Order; fresh: boolean }) {
  const time = new Date(order.createdAt).toLocaleTimeString("fr-CH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`glass rounded-3xl p-5 ${fresh ? "ring-2 ring-sunset" : ""}`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl">{order.daybedId}</h3>
        <span className="text-sm text-white/60">{time}</span>
      </div>
      <ul className="mt-3 space-y-1">
        {order.lines.map((l) => (
          <li key={l.itemId} className="flex justify-between text-lg">
            <span>
              <span className="font-bold text-sunset">{l.qty}×</span> {l.name}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-white/15 pt-2 text-right font-semibold">
        {order.totalChf}.- CHF
      </div>
    </motion.div>
  );
}
