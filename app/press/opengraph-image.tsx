import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Press & Media — Param Minhas | VICE, CNBC-TV18, Storyboard18, Economic Times";
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
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #4a7adb, #f0c4ff, #ff9fd4)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 14, color: "#6a7a9a", letterSpacing: "0.15em", marginBottom: 16, display: "flex" }}>PRESS & MEDIA</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#1a1a2e", marginBottom: 16, display: "flex" }}>Param Minhas</div>
          <div style={{ fontSize: 18, color: "#4a5a7a", marginBottom: 36, display: "flex" }}>Featured in major publications across India and internationally</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {["VICE", "CNBC-TV18", "Storyboard18", "Economic Times", "Open Magazine", "The Established", "Business of Fashion"].map((pub) => (
              <div key={pub} style={{ display: "flex", padding: "10px 16px", background: "#f0f4ff", border: "1px solid #d0d8ec", borderRadius: 6, fontSize: 14, color: "#2a4a8a", fontWeight: 700 }}>{pub}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 13, color: "#6a7a9a" }}>paramminhas.com/press</div>
      </div>
    ),
    { ...size }
  );
}
