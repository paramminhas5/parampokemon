"use client";
import { useEffect, useState } from "react";
import { preloadAllSprites, POKEBALL_URL } from "@/game/sprite-registry";

export function GameBoot({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [minTimePast, setMinTimePast] = useState(false);

  useEffect(() => {
    let cancelled = false;
    preloadAllSprites().then(() => { if (!cancelled) setReady(true); });
    const t = setTimeout(() => setMinTimePast(true), 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const show = ready && minTimePast;

  return (
    <>
      {show ? children : null}
      {!show && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(180deg, #05091a 0%, #0a1228 50%, #0d1a38 100%)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5a80", letterSpacing: "0.3em", marginBottom: 24 }}>
              ★ FIFTEEN YEARS IN THE MAKING
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 28, color: "#7ce0ff", lineHeight: 1.2,
                          textShadow: "0 4px 0 #0a2040, 0 0 40px rgba(124,224,255,0.4)", marginBottom: 6 }}>
              PARAM
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 28, color: "#ffd24a", lineHeight: 1.2,
                          textShadow: "0 4px 0 #3a1a00, 0 0 40px rgba(255,210,74,0.3)", marginBottom: 32 }}>
              QUEST
            </div>
            <img src={POKEBALL_URL} alt="" width={64} height={64}
              style={{ width: 64, height: 64, imageRendering: "pixelated",
                       filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.5))",
                       animation: "pq-spin 1.4s linear infinite" }}
            />
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginTop: 24, letterSpacing: "0.2em" }}>
              NOW LOADING
            </div>
          </div>
        </div>
      )}
    </>
  );
}
