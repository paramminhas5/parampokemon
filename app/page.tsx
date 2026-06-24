"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ZONES, CONTACT, PRESS } from "@/game/data";
import { CareerCard } from "@/components/home/CareerCard";
import { CreatureStrip } from "@/components/home/CreatureStrip";
import { BrandLogos } from "@/components/home/BrandLogos";
import { ContactForm } from "@/components/home/ContactForm";
import { useScrollReveal } from "@/lib/useScrollReveal";

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 38, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!trigger) return;
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, trigger]);
  return displayed;
}

// ─── Counter hook ─────────────────────────────────────────────────────────────
function useCountUp(target: string, trigger: boolean, duration = 700) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    if (!trigger) return;
    // Extract prefix (like $) and suffix (like +, K+, M+)
    const match = target.match(/^([^0-9]*)([0-9.]+)(.*)$/);
    if (!match) { setVal(target); return; }
    const [, prefix, numStr, suffix] = match;
    const num = parseFloat(numStr);
    if (isNaN(num)) { setVal(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = p < 1 ? Math.floor(ease * num) : num;
      setVal(`${prefix}${cur % 1 === 0 ? cur : cur.toFixed(1)}${suffix}`);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [trigger, target, duration]);
  return val;
}


// ─── Snapshot pill ────────────────────────────────────────────────────────────
function SnapshotPill({ label, value, delay }: { label: string; value: string; delay: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const counted = useCountUp(value, visible);
  return (
    <div
      ref={ref}
      className="pq-panel"
      style={{
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div className="pq-panel-inner" style={{ padding: "14px 8px" }}>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 7,
          color: "#4a6888", marginBottom: 6, letterSpacing: "0.08em",
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 16, color: "#c8d8f0",
          borderLeft: "2px solid rgba(124,224,255,0.18)",
          paddingLeft: 8,
        }}>
          {counted}
        </div>
      </div>
    </div>
  );
}

// ─── Section header with typewriter ──────────────────────────────────────────
function SectionHeader({ text, delay = 0 }: { text: string; delay?: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const typed = useTypewriter(text, 40, visible);
  return (
    <div
      ref={ref}
      style={{
        fontFamily: "var(--font-pixel)", fontSize: 8,
        color: "#3a5888",
        textAlign: "center", letterSpacing: "0.15em",
        marginBottom: 20, minHeight: 16,
        opacity: visible ? 1 : 0,
        transition: `opacity 0.3s ease ${delay}ms`,
      }}
    >
      {typed || "\u00a0"}
    </div>
  );
}


// ─── Press row ────────────────────────────────────────────────────────────────
function PressRow({ p, i, total }: { p: { outlet: string; title: string; url: string }; i: number; total: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      style={{
        padding: "10px 0",
        borderBottom: i < total - 1 ? "1px solid #0d1a2a" : "none",
        display: "flex", gap: 12, alignItems: "flex-start",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        transition: `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`,
      }}
    >
      <span style={{
        fontFamily: "var(--font-pixel)", fontSize: 7, color: "#6680bb",
        flexShrink: 0, paddingTop: 4, minWidth: 90,
      }}>{p.outlet}</span>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "var(--font-mono)", fontSize: 18,
          color: "#7ce0ff", textDecoration: "none", lineHeight: 1.4,
        }}
        className="story-link"
      >
        {p.title} ↗
      </a>
    </div>
  );
}

// ─── How to play section ──────────────────────────────────────────────────────
function HowToPlay() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const controls = [
    ["ARROWS / WASD", "Walk"],
    ["TAP / CLICK",   "Walk to + auto-talk"],
    ["SPACE / A",     "Talk to NPCs"],
    ["MAP ⚡",        "Fast travel any world"],
    ["GYM MAT",       "Enter gym battle"],
    ["BAG",           "Mermander + moves + badges"],
  ];
  return (
    <div ref={ref} className="pq-panel">
      <div className="pq-panel-inner">
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 8,
          color: "#4a6888", marginBottom: 12,
        }}>★ HOW TO PLAY</div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 19,
          lineHeight: 1.6, color: "#8aa0c0",
        }}>
          This is <strong style={{ color: "#c8d8f0" }}>PARAM QUEST</strong> — fifteen years of building told as an RPG.
          Walk through 10 worlds. Talk to the people. Fight the bosses. Collect the badges.
          Each gym leader is a <strong style={{ color: "#c8d8f0" }}>real challenge I actually faced</strong>.
          Defeat them to earn the badge and read what I learned. Use the MAP to fast-travel anywhere.
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "4px 24px", marginTop: 16,
        }}>
          {controls.map(([k, v], ci) => (
            <div
              key={k}
              style={{
                display: "flex", gap: 8, padding: "3px 0",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.35s ease ${ci * 80}ms, transform 0.35s ease ${ci * 80}ms`,
              }}
            >
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: "#7ce0ff", flexShrink: 0, minWidth: 100,
              }}>{k}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "#5570a0" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link href="/play" className="pq-btn pq-btn-primary" style={{ fontSize: 12 }}>
            PLAY NOW ▶
          </Link>
        </div>
      </div>
    </div>
  );
}


// ─── Career zones section ─────────────────────────────────────────────────────
function CareerZoneRow({ z, i }: { z: typeof ZONES[0]; i: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-24px)",
        transition: `opacity 0.45s ease ${i * 60}ms, transform 0.45s ease ${i * 60}ms`,
      }}
    >
      <CareerCard z={z} i={i} />
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const { ref, visible } = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  return (
    <footer
      ref={ref}
      style={{
        maxWidth: 860, margin: "0 auto", padding: "0 20px 48px",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      <div style={{
        fontFamily: "var(--font-pixel)", fontSize: 7,
        color: "#2a3a50", lineHeight: 2,
      }}>
        © PARAM MINHAS ·{" "}
        <a href={`mailto:${CONTACT.email}`} style={{ color: "#3a5070", textDecoration: "none" }}>
          {CONTACT.email}
        </a>
        {" · "}
        <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#3a5070", textDecoration: "none" }}>
          LINKEDIN
        </a>
        {" · "}
        <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" style={{ color: "#3a5070", textDecoration: "none" }}>
          GITHUB
        </a>
        {" · "}
        <a href={CONTACT.iterate} target="_blank" rel="noopener noreferrer" style={{ color: "#3a5070", textDecoration: "none" }}>
          ITERATE
        </a>
        {" · "}
        <a href={CONTACT.site} target="_blank" rel="noopener noreferrer" style={{ color: "#3a5070", textDecoration: "none" }}>
          CATSCANDANCE.COM
        </a>
      </div>
    </footer>
  );
}

// ─── HERO PRESS START pulse ───────────────────────────────────────────────────
const PRESS_START_GLOW = `
@keyframes btn-glow-pulse {
  0%,100% { box-shadow: 0 0 8px rgba(124,224,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.4); }
  50%      { box-shadow: 0 0 22px rgba(124,224,255,0.45), 0 0 40px rgba(124,224,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.4); }
}
`;


// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const careerZones = ZONES.filter(z => z.id !== "home" && z.id !== "origin");
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #04080f 0%, #070e1a 30%, #0a1428 70%, #0c1830 100%)",
    }}>
      <style>{PRESS_START_GLOW}</style>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 860, margin: "0 auto", padding: "60px 20px 40px",
        textAlign: "center", position: "relative",
      }}>
        {/* Scanline grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(124,224,255,0.012) 3px, rgba(124,224,255,0.012) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(124,224,255,0.008) 3px, rgba(124,224,255,0.008) 4px)
          `,
          zIndex: 0,
        }} />

        {/* Creature strip */}
        <CreatureStrip zones={careerZones} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 9,
            color: "#3a5a80", letterSpacing: "0.25em", marginBottom: 20,
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 0.5s ease 100ms",
          }}>★ A PLAYABLE PORTFOLIO</div>

          <h1 style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "clamp(32px, 8vw, 64px)",
            lineHeight: 1.1, margin: "0 0 8px",
            color: "#7ce0ff",
            textShadow: "0 6px 0 #0a2040, 0 0 40px rgba(124,224,255,0.35)",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.55s ease 180ms, transform 0.55s ease 180ms",
          }}>PARAM<br />MINHAS</h1>

          {/* Tagline */}
          <div style={{
            maxWidth: 500, margin: "16px auto",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease 300ms, transform 0.5s ease 300ms",
          }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 20,
              color: "#8aa0c0", margin: "0 0 4px", lineHeight: 1.4,
            }}>
              Founder & Creative Director
            </p>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 14,
              color: "#4a6080", margin: 0, lineHeight: 1.5,
              letterSpacing: "0.04em",
            }}>
              Growth & Brand Leadership | GTM | AI-Native Marketing | Creative Direction | Product
            </p>
          </div>

          <div style={{
            display: "flex", gap: 12, justifyContent: "center",
            flexWrap: "wrap", marginTop: 28,
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 0.5s ease 420ms",
          }}>
            <Link
              href="/play"
              className="pq-btn pq-btn-primary"
              style={{
                fontSize: 13, padding: "18px 32px",
                animation: "btn-glow-pulse 2.4s ease-in-out 1.2s infinite",
              }}
            >
              PRESS START <span className="pq-blink">▶</span>
            </Link>
            <Link href="/resume" className="pq-btn" style={{ fontSize: 13, padding: "18px 24px" }}>
              READ CV
            </Link>
          </div>

          <div style={{
            fontFamily: "var(--font-pixel)", fontSize: 7, color: "#2a3a50",
            marginTop: 14, letterSpacing: "0.15em",
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 0.5s ease 560ms",
          }}>
            ARROWS · WASD · TAP · SWIPE · SPACE
          </div>
        </div>
      </section>


      {/* ── STATS ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {[
            { label: "YEARS BUILDING", value: "15+" },
            { label: "REVENUE",        value: "$6M+" },
            { label: "COMMUNITY",      value: "350K+" },
            { label: "TEAM & NETWORK LED", value: "90+" },
            { label: "RAISED",         value: "$795K" },
          ].map((s, i) => (
            <SnapshotPill key={s.label} label={s.label} value={s.value} delay={i * 60} />
          ))}
        </div>
      </section>

      {/* ── CAREER ZONES ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px" }}>
        <SectionHeader text="★ THE CAREER · CHAPTER BY CHAPTER" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {careerZones.map((z, i) => (
            <CareerZoneRow key={z.id} z={z} i={i} />
          ))}
        </div>
      </section>

      {/* ── BRAND LOGOS ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px" }}>
        <SectionHeader text="★ BRANDS" />
        <BrandLogos />
      </section>

      {/* ── PRESS ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 32px" }}>
        <SectionHeader text="★ SELECTED PRESS" />
        <div className="pq-panel">
          <div className="pq-panel-inner">
            {PRESS.map((p, i) => (
              <PressRow key={i} p={p} i={i} total={PRESS.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px" }}>
        <SectionHeader text="★ LET'S TALK" />
        <ContactForm />
      </section>

      {/* ── HOW TO PLAY ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 32px" }}>
        <HowToPlay />
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
