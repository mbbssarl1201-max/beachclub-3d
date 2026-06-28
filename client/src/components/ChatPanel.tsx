import { useState } from "react";
import { useStore } from "../store";

interface Msg {
  role: "user" | "agent";
  text: string;
}

export function ChatPanel({ daybedId }: { daybedId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "agent", text: "Bonjour ! Que puis-je vous servir ?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const cart = useStore((s) => s.cart);
  const setCart = useStore((s) => s.setCart);

  const send = async () => {
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setBusy(true);
    try {
      const res = await fetch("/api/agent/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ daybedId, message, cart }),
      });
      const data = await res.json();
      if (Array.isArray(data.cart)) setCart(data.cart);
      setMsgs((m) => [...m, { role: "agent", text: data.reply ?? "…" }]);
    } catch {
      setMsgs((m) => [...m, { role: "agent", text: "Réseau indisponible — utilisez la carte ci-dessus." }]);
    }
    setBusy(false);
  };

  return (
    <div className="glass flex h-72 flex-col rounded-3xl p-4">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-lagoon/80" : "bg-white/12"
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && <div className="text-xs text-white/50">l'agent réfléchit…</div>}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ex : 2 mojitos et un ceviche"
          className="flex-1 rounded-full bg-white/15 px-4 py-2 text-sm placeholder-white/50 outline-none"
        />
        <button onClick={send} className="rounded-full bg-sunset px-4 py-2 text-sm font-semibold">
          →
        </button>
      </div>
    </div>
  );
}
