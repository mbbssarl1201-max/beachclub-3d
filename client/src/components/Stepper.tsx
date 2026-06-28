import { useStore, type Step } from "../store";

const STEPS = ["Date", "Emplacement", "Extras", "Récapitulatif", "Confirmer"];

export function Stepper() {
  const step = useStore((s) => s.step);
  const setStep = useStore((s) => s.setStep);
  const date = useStore((s) => s.date);
  const furnitureId = useStore((s) => s.furnitureId);

  const reachable = (i: number): boolean => {
    if (i <= step) return true;
    if (i === 1) return !!date;
    if (i >= 2) return !!date && !!furnitureId;
    return false;
  };

  return (
    <div className="glass pointer-events-auto flex items-center gap-1 rounded-full px-2 py-1.5 text-sm sm:gap-2 sm:px-3">
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <button
            key={label}
            disabled={!reachable(i)}
            onClick={() => reachable(i) && setStep(i as Step)}
            className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition disabled:opacity-40 sm:px-3 ${
              current ? "bg-sunset text-white" : done ? "text-lagoon" : "text-white/70"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${current ? "bg-white/25" : "bg-white/15"}`}>
              {done ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
