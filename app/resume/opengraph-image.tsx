import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Resume — Param Minhas | Founder & Creative Director | 15+ Years Experience";
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
          background: "#ffffff",
          fontFamily: "monospace",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #2a4a8a, #7ce0ff, #f0c4ff, #00e8a0)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#1a1a2e", display: "flex" }}>
              PARAM MINHAS
            </div>
            <div style={{ fontSize: 22, color: "#4a5a7a", marginTop: 8, display: "flex" }}>
              Founder & Creative Director
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              background: "#f0f4ff",
              border: "2px solid #d0d8ec",
              borderRadius: 8,
              fontSize: 14,
              color: "#2a4a8a",
              fontWeight: 700,
            }}
          >
            RESUME / CV
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 16, color: "#6a6a8a", marginBottom: 36, display: "flex" }}>
          Growth & Brand Leadership | GTM | AI-Native Marketing | Creative Direction | Product
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 24, marginBottom: 40 }}>
          {[
            { label: "Experience", value: "15+ Years" },
            { label: "Revenue", value: "$6M+" },
            { label: "Community", value: "350K+" },
            { label: "Network Led", value: "90-Person" },
            { label: "Raised", value: "$795K" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 18px",
                background: "#f0f4ff",
                border: "1px solid #d0d8f0",
                borderRadius: 6,
                flex: 1,
              }}
            >
              <span style={{ fontSize: 11, color: "#6a7a9a", letterSpacing: "0.08em" }}>
                {stat.label.toUpperCase()}
              </span>
              <span style={{ fontSize: 18, color: "#2a4a8a", fontWeight: 700 }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Career highlights */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Iterate — AI-native agency, 90-person network (2026–Present)",
            "Fere.ai — CMO, autonomous AI agents (2025)",
            "SoleSearch — Founder & CEO, $6M+ revenue (2022–2024)",
            "Good Capital — Partner, portfolio incl. Meesho (2017–2020)",
          ].map((line) => (
            <div key={line} style={{ fontSize: 15, color: "#2a2a4a", display: "flex" }}>
              • {line}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: "#8a8aa0",
          }}
        >
          <span>minhas.param@gmail.com</span>
          <span>linkedin.com/in/paramminhas</span>
          <span>hyperiterate.com</span>
          <span>Bengaluru, India</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
