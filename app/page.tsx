import Link from "next/link";
import { ZONES, CONTACT, PRESS } from "@/game/data";
import { CareerCard } from "@/components/home/CareerCard";

const SNAPSHOT = [
  { label: "YEARS", value: "15+" },
  { label: "RAISED", value: "$795K · $1.3M" },
  { label: "ANNUAL REV", value: "₹30Cr+" },
  { label: "AI SINCE", value: "2013" },
  { label: "EVENTS", value: "30+" },
  { label: "AGENCIES", value: "0" },
];

export default function Home() {
  const careerZones = ZONES.filter(z => z.id !== "home");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #04080f 0%, #070e1a 30%, #0a1428 70%, #0c1830 100%)",
    }}>
      {/* HERO */}
      <section style={{
        maxWidth: 860, margin: "0 auto", padding: "60px 20px 40px",
        textAlign: "center", position: "relative",
      }}>
        {/* Creature strip behind hero */}
        <div style={{
          position: "absolute", top: 20, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 0,
          opacity: 0.06, pointerEvents: "none",
          overflow: "hidden",
        }}>
          {careerZones.filter(z => z.creature).map(z => (
            <img key={z.id} src={`/sprites/creatures/${z.id}.png`} alt=""
              style={{ width: 80, height: 80, imageRendering: "pixelated" }} />
          ))}
        </div>

        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 9,
          color: "#3a5a80", letterSpacing: "0.25em", marginBottom: 20,
        }}>★ A PLAYABLE PORTFOLIO</div>

        <h1 style={{
          fontFamily: "var(--font-pixel)",
          fontSize: "clamp(32px, 8vw, 64px)",
          lineHeight: 1.1, margin: "0 0 8px",
          color: "#7ce0ff",
          textShadow: "0 6px 0 #0a2040, 0 0 40px rgba(124,224,255,0.35)",
        }}>PARAM<br />MINHAS</h1>

        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 22,
          color: "#8aa0c0", maxWidth: 500, margin: "16px auto",
          lineHeight: 1.5,
        }}>
          Builder. Designer. Director. Fifteen years across e-commerce, AI, real estate, sneakers, music, and AI-native marketing.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/play" className="pq-btn pq-btn-primary" style={{ fontSize: 13, padding: "18px 32px" }}>
            PRESS START <span className="pq-blink">▶</span>
          </Link>
          <Link href="/resume" className="pq-btn" style={{ fontSize: 13, padding: "18px 24px" }}>READ CV</Link>
        </div>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 7, color: "#2a3a50",
          marginTop: 14, letterSpacing: "0.15em",
        }}>ARROWS · WASD · TAP · SWIPE · SPACE</div>
      </section>

      {/* SNAPSHOT */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
        }}>
          {SNAPSHOT.map(s => (
            <div key={s.label} className="pq-panel" style={{ textAlign: "center" }}>
              <div className="pq-panel-inner" style={{ padding: "12px 8px" }}>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginBottom: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "#c8d8f0" }}>
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CAREER ZONES */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 8, color: "#2a3a50",
          textAlign: "center", letterSpacing: "0.15em", marginBottom: 20,
        }}>★ TEN WORLDS · THE FULL CAREER</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {careerZones.map((z, i) => (
            <CareerCard key={z.id} z={z} i={i} />
          ))}
        </div>
      </section>

      {/* GYM LEADERS STRIP — bottom, centered on desktop */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 32px" }}>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 8, color: "#2a3a50",
          textAlign: "center", letterSpacing: "0.2em", marginBottom: 16,
        }}>★ THE GYM LEADERS</div>
        <div style={{
          display: "flex", gap: 0,
          justifyContent: "center",
          flexWrap: "wrap",
          overflowX: "auto", padding: "0 0 8px",
          WebkitOverflowScrolling: "touch" as const,
          scrollbarWidth: "none",
        }}>
          {careerZones.filter(z => z.gym).map(z => (
            <div key={z.id} style={{ flexShrink: 0, textAlign: "center", padding: "0 8px" }}>
              <div style={{
                width: 88, height: 88,
                border: `2px solid ${z.theme.accent}40`,
                background: `${z.theme.accent}08`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <img
                  src={`/sprites/leaders/${z.gym!.leader}.png`}
                  alt={z.gym!.opponentName}
                  style={{ width: 80, height: 80, imageRendering: "pixelated" }}
                />
              </div>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: z.theme.accent, marginTop: 6, maxWidth: 88,
                lineHeight: 1.4,
              }}>{z.gym!.opponentName}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO PLAY */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 32px" }}>
        <div className="pq-panel">
          <div className="pq-panel-inner">
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", marginBottom: 12 }}>
              ★ HOW TO PLAY
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 19, lineHeight: 1.6, color: "#8aa0c0" }}>
              This is <strong style={{ color: "#c8d8f0" }}>PARAM QUEST</strong> — fifteen years of building told as an RPG.
              Walk through 10 worlds. Talk to the people. Fight the bosses. Collect the badges.
              Each gym leader is a <strong style={{ color: "#c8d8f0" }}>real challenge I actually faced</strong>.
              Defeat them to earn the badge and read what I learned. Use the MAP to fast-travel anywhere.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", marginTop: 16 }}>
              {[
                ["ARROWS / WASD", "Walk"],
                ["TAP / CLICK", "Walk to + auto-talk"],
                ["SPACE / A", "Talk to NPCs"],
                ["MAP ⚡", "Fast travel any world"],
                ["GYM MAT", "Enter gym battle"],
                ["BAG", "Mermander + moves + badges"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, padding: "3px 0" }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#7ce0ff", flexShrink: 0, minWidth: 80 }}>{k}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "#5570a0" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Link href="/play" className="pq-btn pq-btn-primary" style={{ fontSize: 12 }}>PLAY NOW ▶</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRESS */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 32px" }}>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 8, color: "#2a3a50",
          textAlign: "center", letterSpacing: "0.15em", marginBottom: 16,
        }}>★ SELECTED PRESS</div>
        <div className="pq-panel">
          <div className="pq-panel-inner">
            {PRESS.map((p, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderBottom: i < PRESS.length - 1 ? "1px solid #0d1a2a" : "none",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 7, color: "#5570aa",
                  flexShrink: 0, paddingTop: 4, minWidth: 90,
                }}>{p.outlet}</span>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: 18,
                    color: "#7ce0ff", textDecoration: "none",
                    lineHeight: 1.4,
                  }}
                  className="story-link"
                >
                  {p.title} ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        maxWidth: 860, margin: "0 auto", padding: "0 20px 48px",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#1a2a40", lineHeight: 2 }}>
          © PARAM MINHAS ·{" "}
          <a href={`mailto:${CONTACT.email}`} style={{ color: "#2a3a55", textDecoration: "none" }}>{CONTACT.email}</a>
          {" · "}
          <a href={CONTACT.linkedin} style={{ color: "#2a3a55", textDecoration: "none" }}>LINKEDIN</a>
          {" · "}
          <a href={CONTACT.site} style={{ color: "#2a3a55", textDecoration: "none" }}>CATSCANDANCE.COM</a>
        </div>
      </footer>
    </div>
  );
}