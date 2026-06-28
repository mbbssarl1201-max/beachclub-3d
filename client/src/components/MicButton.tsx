import { useRef, useState } from "react";
import { useStore } from "../store";
import type { CartLine } from "@beachclub/shared/types";

// Encodes Float32 mic samples to base64 16-bit PCM (16 kHz) for Gemini Live.
function floatToBase64PCM(input: Float32Array): string {
  const buf = new ArrayBuffer(input.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function MicButton({ daybedId, onFallback }: { daybedId: string; onFallback: () => void }) {
  const [active, setActive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const setCart = useStore((s) => s.setCart);

  const stop = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    setActive(false);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const proto = location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${location.host}/ws/voice?daybed=${daybedId}`);
      wsRef.current = ws;

      const ctx = new AudioContext({ sampleRate: 16000 });
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      proc.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "audio", data: floatToBase64PCM(e.inputBuffer.getChannelData(0)) }));
        }
      };
      src.connect(proc);
      proc.connect(ctx.destination);

      ws.onmessage = (ev) => {
        try {
          const f = JSON.parse(ev.data);
          if (f.type === "cart" && Array.isArray(f.cart)) setCart(f.cart as CartLine[]);
          else if (f.type === "error") {
            stop();
            onFallback();
          }
        } catch {
          /* ignore */
        }
      };
      ws.onerror = () => {
        stop();
        onFallback();
      };

      cleanupRef.current = () => {
        proc.disconnect();
        src.disconnect();
        ctx.close();
        stream.getTracks().forEach((t) => t.stop());
      };
      setActive(true);
    } catch {
      onFallback();
    }
  };

  return (
    <button
      onClick={active ? stop : start}
      className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow-lg transition ${
        active ? "animate-pulse bg-sunset" : "bg-lagoon"
      }`}
      title={active ? "Arrêter" : "Parler à l'agent"}
    >
      {active ? "■" : "🎙"}
    </button>
  );
}
