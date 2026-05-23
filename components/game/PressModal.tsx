"use client";
import { PRESS } from "@/game/data";

export function PressModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "rgba(4,8,20,0.96)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 480,
          border: "2px solid #ff9fd4",
          background: "linear-gradient(180deg, #120810 0%, #0a0510 100%)",
          boxShadow: "0 0 40px #ff9fd420",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Breaking news header */}
        <div style={{
          background: "#ff9fd4",
          padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            background: "#c0388c",
            padding: "4px 8px",
            fontFamily: "var(--font-pixel)", fontSize: 8,
            color: "#fff",
            animation: "blink 1s step-end infinite",
          }}>
            ● LIVE
          </div>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 9, color: "#0a0510" }}>
            PRESS WALL — SOLESEARCH
          </div>
          <button onClick={onClose} style={{
            marginLeft: "auto",
            background: "none", border: "none",
            color: "#4a1240", padding: "4px 8px",
            fontFamily: "var(--font-pixel)", fontSize: 10, cursor: "pointer",
          }}>✕</button>
        </div>

        {/* Stats strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          borderBottom: "2px solid #2a1040",
          background: "#080510",
        }}>
          {[
            { label: "RAISED", value: "$795K" },
            { label: "YEARLY SALES", value: "₹26Cr+" },
            { label: "LIVE EVENTS", value: "30+" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "10px 12px", borderRight: "1px solid #2a1040",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#ff9fd4", marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 13, color: "#fff" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Featured quote */}
        <div style={{
          padding: "16px",
          borderBottom: "2px solid #2a1040",
          background: "#100818",
        }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#ff9fd4", marginBottom: 8 }}>
            ★ FEATURED
          </div>
          <blockquote style={{
            fontFamily: "var(--font-pixel)", fontSize: 9,
            color: "#e8c8f8", lineHeight: 1.8,
            margin: 0,
            paddingLeft: 12,
            borderLeft: "2px solid #ff9fd4",
          }}>
            &ldquo;Param Minhas, co-founder of SoleSearch... ₹30-35 crore in sales last fiscal year.&rdquo;
          </blockquote>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#6a3060", marginTop: 8 }}>
            — Business of Fashion
          </div>
        </div>

        {/* Press links */}
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#6a3060", marginBottom: 10 }}>
            COVERAGE
          </div>
          {PRESS.map((p, i) => (
            <a
              key={i}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 0",
                borderBottom: i < PRESS.length - 1 ? "1px solid #1a0828" : "none",
                textDecoration: "none",
                color: "var(--color-dialog)",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ff9fd4")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-dialog)")}
            >
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: "#ff9fd4", flexShrink: 0,
                width: 80, paddingTop: 2,
              }}>
                {p.outlet.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                {p.title} ↗
              </div>
            </a>
          ))}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "2px solid #1a1028" }}>
          <button onClick={onClose} style={{
            width: "100%",
            background: "#ff9fd420", border: "1px solid #ff9fd460",
            color: "#ff9fd4", padding: "12px",
            fontFamily: "var(--font-pixel)", fontSize: 9, cursor: "pointer",
          }}>
            ▸ BACK TO SOLESEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
