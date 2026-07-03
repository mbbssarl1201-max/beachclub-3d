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

// Decodes a base64 16-bit PCM frame (Gemini Live output, 24 kHz) to Float32.
function base64PCMToFloat(data: string): Float32Array {
  const bin = atob(data);
  const samples = new Float32Array(bin.length / 2);
  for (let i = 0; i < samples.length; i++) {
    let v = bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8);
    if (v >= 0x8000) v -= 0x10000;
    samples[i] = v / 0x8000;
  }
  return samples;
}

const GEMINI_OUTPUT_RATE = 24000;

/** Sequential playback queue for the agent's voice, with barge-in flush. */
class VoicePlayer {
  private ctx = new AudioContext({ sampleRate: GEMINI_OUTPUT_RATE });
  private nextStart = 0;
  private playing = new Set<AudioBufferSourceNode>();

  enqueue(base64: string) {
    const samples = base64PCMToFloat(base64);
    if (samples.length === 0) return;
    const buffer = this.ctx.createBuffer(1, samples.length, GEMINI_OUTPUT_RATE);
    buffer.getChannelData(0).set(samples);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.ctx.destination);
    this.playing.add(src);
    src.onended = () => this.playing.delete(src);
    const at = Math.max(this.ctx.currentTime, this.nextStart);
    src.start(at);
    this.nextStart = at + buffer.duration;
  }

  /** Barge-in: drop everything queued or playing. */
  flush() {
    for (const src of this.playing) {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    }
    this.playing.clear();
    this.nextStart = 0;
  }

  close() {
    this.flush();
    this.ctx.close();
  }
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

      const player = new VoicePlayer();

      ws.onmessage = (ev) => {
        try {
          const f = JSON.parse(ev.data);
          if (f.type === "audio" && f.data) player.enqueue(f.data);
          else if (f.type === "interrupted") player.flush();
          else if (f.type === "cart" && Array.isArray(f.cart)) setCart(f.cart as CartLine[]);
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
        player.close();
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
      aria-label={active ? "Arrêter la commande vocale" : "Parler à l'agent"}
    >
      {active ? "■" : "🎙"}
    </button>
  );
}
