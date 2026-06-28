import { useRef, useState, type ReactNode } from "react";
import { AERIAL_URL } from "../aerial";

// CSS placeholder backdrop that reads as an aerial resort (sea, sand, pools).
// Replaced by the photoreal image when AERIAL_URL is set.
function PlaceholderAerial() {
  return (
    <div className="absolute inset-0">
      {/* sand base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 10%, #efe0c4 0%, #e6c9a0 40%, #d8b483 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,12,30,0.25), rgba(0,0,0,0) 30%)" }} />
      {/* sea at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-[26%]" style={{ background: "linear-gradient(180deg, #1f9aa0 0%, #0e6f87 60%, #0a5a78 100%)" }} />
      <div className="absolute inset-x-0" style={{ top: "72%", height: "6%", background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0))", filter: "blur(6px)" }} />
      {/* pools / lagoon */}
      <div className="absolute rounded-[50%]" style={{ left: "44%", top: "55%", width: "20%", height: "16%", background: "radial-gradient(circle, #25c3c0, #0e8f96)", filter: "blur(2px)", opacity: 0.9 }} />
      <div className="absolute rounded-[45%]" style={{ left: "62%", top: "50%", width: "16%", height: "13%", background: "radial-gradient(circle, #25c3c0, #0e8f96)", filter: "blur(2px)", opacity: 0.85 }} />
      <div className="absolute rounded-[50%]" style={{ left: "12%", top: "70%", width: "14%", height: "10%", background: "radial-gradient(circle, #2bcfca, #0e8f96)", filter: "blur(2px)", opacity: 0.8 }} />
      {/* greenery patches */}
      <div className="absolute rounded-[40%]" style={{ left: "70%", top: "20%", width: "26%", height: "30%", background: "radial-gradient(circle, #3f7d4f, #285a37)", filter: "blur(8px)", opacity: 0.5 }} />
      <div className="absolute rounded-[40%]" style={{ left: "2%", top: "18%", width: "18%", height: "26%", background: "radial-gradient(circle, #3f7d4f, #285a37)", filter: "blur(10px)", opacity: 0.45 }} />
      {/* placeholder note */}
      <div className="absolute left-1/2 top-[44%] -translate-x-1/2 text-center text-white/40 text-xs tracking-widest">
        APERÇU · rendu aérien photoréaliste à venir
      </div>
    </div>
  );
}

export function AerialMap({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const clampZoom = (z: number) => Math.min(2.6, Math.max(1, z));

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onWheel={(e) => {
        setZoom((z) => clampZoom(z - e.deltaY * 0.0015));
      }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setPan({
          x: drag.current.px + (e.clientX - drag.current.x),
          y: drag.current.py + (e.clientY - drag.current.y),
        });
      }}
      onPointerUp={() => (drag.current = null)}
      style={{ cursor: drag.current ? "grabbing" : "grab", touchAction: "none" }}
    >
      <div
        className="absolute inset-0 origin-center"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: drag.current ? "none" : "transform 0.15s ease-out" }}
      >
        {AERIAL_URL ? (
          <img src={AERIAL_URL} alt="Plan du club" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        ) : (
          <PlaceholderAerial />
        )}
        {children}
      </div>

      {/* zoom controls */}
      <div className="absolute bottom-28 right-4 z-20 flex flex-col gap-1 sm:bottom-6 sm:right-20">
        <button onClick={() => setZoom((z) => clampZoom(z + 0.3))} className="glass h-10 w-10 rounded-full text-xl">+</button>
        <button onClick={() => setZoom((z) => clampZoom(z - 0.3))} className="glass h-10 w-10 rounded-full text-xl">−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="glass h-10 w-10 rounded-full text-xs">⟲</button>
      </div>
    </div>
  );
}
