import { useEffect, useState } from "react";
import { useStore } from "../store";
import type { MenuItem, MenuCategory } from "@beachclub/shared/types";

const LABELS: Record<MenuCategory, string> = {
  cocktail: "Cocktails",
  food: "À manger",
  soft: "Sans alcool",
  bottle: "Bouteilles",
};

export function MenuGrid() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const addLine = useStore((s) => s.addLine);

  const load = () => {
    setState("loading");
    fetch("/api/menu")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((m: MenuItem[]) => {
        setMenu(m);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  if (state === "loading") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="glass h-12 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="glass rounded-2xl p-4 text-center text-sm">
        <p>La carte n'a pas pu être chargée.</p>
        <button onClick={load} className="mt-2 rounded-full bg-sunset px-4 py-1.5 font-semibold">
          Réessayer
        </button>
      </div>
    );
  }

  const cats: MenuCategory[] = ["cocktail", "food", "soft", "bottle"];

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
                  aria-label={`Ajouter ${m.name} au panier`}
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
