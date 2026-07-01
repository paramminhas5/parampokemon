import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "About Param Minhas — Founder, Creative Director & Growth Operator | Bengaluru, India";
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
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #2a4a8a, #7ce0ff, #00e8a0)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 14, color: "#6a7a9a", letterSpacing: "0.15em", marginBottom: 16, display: "flex" }}>ABOUT</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#1a1a2e", marginBottom: 12, display: "flex" }}>Param Minhas</div>
          <div style={{ fontSize: 22, color: "#4a5a7a", marginBottom: 8, display: "flex" }}>Founder & Creative Director</div>
          <div style={{ fontSize: 16, color: "#6a6a8a", marginBottom: 32, display: "flex" }}>Bengaluru, India · 15+ years building</div>
          <div style={{ fontSize: 16, color: "#2a2a4a", lineHeight: 1.6, maxWidth: 800, display: "flex" }}>
            Builder, designer, and growth operator across AI, e-commerce, sneakers, music, and marketing. Currently running Iterate (AI-native agency, 90-person network) and Cats Can Dance (culture platform).
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#6a7a9a" }}>
          <span>hyperiterate.com</span>
          <span>catscandance.com</span>
          <span>linkedin.com/in/paramminhas</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
