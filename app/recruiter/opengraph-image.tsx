import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Recruiter Quick View — Param Minhas | 15+ Years, $6M+ Revenue, 90-Person Network";
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
          background: "linear-gradient(135deg, #020810 0%, #04101e 40%, #0a1830 100%)",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "30%",
            width: "40%",
            height: "60%",
            background: "radial-gradient(ellipse, rgba(255, 210, 74, 0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            padding: "10px 24px",
            background: "rgba(255, 210, 74, 0.1)",
            border: "1px solid rgba(255, 210, 74, 0.35)",
            borderRadius: 6,
            fontSize: 14,
            color: "#ffd24a",
            letterSpacing: "0.25em",
          }}
        >
          ⚡ RECRUITER QUICK VIEW
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#c8d8f0",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 12,
            textShadow: "0 4px 0 #0a2040",
            display: "flex",
          }}
        >
          PARAM MINHAS
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 22,
            color: "#7ce0ff",
            marginBottom: 8,
            display: "flex",
          }}
        >
          Founder & Creative Director — Iterate
        </div>

        <div
          style={{
            fontSize: 16,
            color: "#5a7898",
            marginBottom: 32,
            display: "flex",
          }}
        >
          Growth · Brand · GTM · AI-Native Marketing · Creative Direction
        </div>

        {/* Career highlights */}
        <div style={{ display: "flex", gap: 20, marginBottom: 32 }}>
          {[
            { org: "Iterate", role: "Founder", color: "#7ce0ff" },
            { org: "SoleSearch", role: "$6M+ Rev", color: "#ff9fd4" },
            { org: "Good Capital", role: "Partner", color: "#f0c4ff" },
            { org: "Fere.ai", role: "CMO", color: "#00e8a0" },
          ].map((h) => (
            <div
              key={h.org}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "12px 18px",
                background: "rgba(4, 8, 20, 0.7)",
                border: `1px solid ${h.color}40`,
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 16, color: h.color, fontWeight: 700 }}>{h.org}</span>
              <span style={{ fontSize: 12, color: "#4a6888" }}>{h.role}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 24, fontSize: 14, color: "#4a6888" }}>
          <span>15+ Years</span>
          <span style={{ color: "#2a4060" }}>·</span>
          <span>$6M+ Revenue</span>
          <span style={{ color: "#2a4060" }}>·</span>
          <span>350K+ Community</span>
          <span style={{ color: "#2a4060" }}>·</span>
          <span>90-Person Network</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
