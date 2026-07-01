import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Play Param Quest — A Playable Portfolio RPG | 15 Years of Career as a Pokemon-Style Game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #04080f 0%, #0a1428 50%, #1a0a28 100%)",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Starfield dots */}
        {[
          { x: 100, y: 80 }, { x: 300, y: 120 }, { x: 500, y: 60 },
          { x: 700, y: 140 }, { x: 900, y: 90 }, { x: 1100, y: 110 },
          { x: 150, y: 500 }, { x: 400, y: 550 }, { x: 800, y: 520 },
          { x: 1050, y: 480 },
        ].map((dot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "rgba(124, 224, 255, 0.4)",
              display: "flex",
            }}
          />
        ))}

        {/* Game badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
            padding: "10px 24px",
            background: "rgba(240, 196, 255, 0.1)",
            border: "1px solid rgba(240, 196, 255, 0.3)",
            borderRadius: 8,
            fontSize: 14,
            color: "#f0c4ff",
            letterSpacing: "0.25em",
          }}
        >
          ▶ PLAYABLE PORTFOLIO RPG
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#7ce0ff",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            marginBottom: 8,
            textShadow: "0 6px 0 #0a2040, 0 0 60px rgba(124, 224, 255, 0.4)",
            display: "flex",
          }}
        >
          PARAM QUEST
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#8aa0c0",
            marginBottom: 36,
            textAlign: "center",
            display: "flex",
          }}
        >
          15 years of building — told as a Pokemon-style RPG
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            "10 Zones",
            "9 Gym Battles",
            "Full Battle System",
            "Synthesized Audio",
            "Zero Audio Files",
          ].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                padding: "10px 16px",
                background: "rgba(0, 232, 160, 0.08)",
                border: "1px solid rgba(0, 232, 160, 0.25)",
                borderRadius: 6,
                fontSize: 14,
                color: "#00e8a0",
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 18,
            color: "#4a6888",
          }}
        >
          <span>paramminhas.com/play</span>
          <span style={{ color: "#7ce0ff" }}>— PRESS START</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
