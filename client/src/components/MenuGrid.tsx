import { useEffect, useState } from "react";
import { useStore } from "../store";
import type { MenuItem, MenuCategory } from "@beachclub/shared/types";

const LABELS: Record<MenuCategory, string> = {
  cocktail: "Cocktails",
  food: "À manger",
  soft: "Sans alcool",
};

export function MenuGrid() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const addLine = useStore((s) => s.addLine);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setMenu);
  }, []);

  const cats: MenuCategory[] = ["cocktail", "food", "soft"];

  return (
    <div className="space-y-5">
      {cats.map((cat) => (
        <section key={cat}>
          <h3 className="font-display mb-2 text-lg text-white/90">{LABELS[cat]}</h3>
          <div className="grid grid-cols-2 gap-2">
            {menu
              .filter((m) => m.category === cat)
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => addLine(m, 1)}
                  className="glass flex items-center justify-between rounded-2xl px-3 py-3 text-left transition active:scale-95"
                >
                  <span className="text-sm">{m.name}</span>
                  <span className="text-xs text-white/70">{m.priceChf}.-</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
