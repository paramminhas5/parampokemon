import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Param Minhas — Builder · Designer · Creative Director | 15+ Years, $6M+ Revenue";
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
          background: "linear-gradient(135deg, #04080f 0%, #0a1428 40%, #0c1830 100%)",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.06,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, #7ce0ff 39px, #7ce0ff 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #7ce0ff 39px, #7ce0ff 40px)",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            padding: "8px 20px",
            background: "rgba(124, 224, 255, 0.1)",
            border: "1px solid rgba(124, 224, 255, 0.3)",
            borderRadius: 6,
            fontSize: 16,
            color: "#7ce0ff",
            letterSpacing: "0.2em",
          }}
        >
          ★ A PLAYABLE PORTFOLIO
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#7ce0ff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 12,
            textShadow: "0 4px 0 #0a2040, 0 0 40px rgba(124, 224, 255, 0.3)",
            display: "flex",
          }}
        >
          PARAM MINHAS
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 24,
            color: "#8aa0c0",
            marginBottom: 32,
            display: "flex",
          }}
        >
          Builder · Designer · Creative Director
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginBottom: 32,
          }}
        >
          {[
            { label: "YEARS", value: "15+" },
            { label: "REVENUE", value: "$6M+" },
            { label: "COMMUNITY", value: "350K+" },
            { label: "NETWORK", value: "90+" },
            { label: "RAISED", value: "$795K" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "12px 16px",
                background: "rgba(124, 224, 255, 0.05)",
                border: "1px solid rgba(124, 224, 255, 0.15)",
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 12, color: "#4a6888", letterSpacing: "0.15em" }}>
                {stat.label}
              </span>
              <span style={{ fontSize: 22, color: "#c8d8f0", fontWeight: 700 }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom info */}
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 14,
            color: "#4a6888",
          }}
        >
          <span>hyperiterate.com</span>
          <span>·</span>
          <span>catscandance.com</span>
          <span>·</span>
          <span>Bengaluru, India</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
