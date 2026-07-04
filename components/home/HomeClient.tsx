"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "motion/react";
import { ZONES, CONTACT, PRESS } from "@/game/data";
import { CareerCard } from "@/components/home/CareerCard";
import { CreatureStrip, CREATURE_DRIFT_STYLES } from "@/components/home/CreatureStrip";
import { CREATURE_URL } from "@/game/sprite-registry";
import { BrandLogos } from "@/components/home/BrandLogos";
import { ContactForm } from "@/components/home/ContactForm";
import { SpotlightHero } from "@/components/home/SpotlightHero";
import { useScrollReveal } from "@/lib/useScrollReveal";

// ─── Scroll progress bar (ties the whole page to scroll) ──────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 100,
        transformOrigin: "0%", scaleX,
        background: "linear-gradient(90deg, #7ce0ff, #a06fff, #ff9fd4)",
        boxShadow: "0 0 12px rgba(124,224,255,0.6)",
      }}
    />
  );
}

// ─── Scroll-linked section wrapper ─────────────────────────────────────────
// Unlike the old one-shot "fade in once when visible" reveal, this keeps every
// section's opacity/position/scale continuously bound to actual scroll
// progress through its own bounds — so content settles in as it arrives and
// eases out as it leaves, instead of firing once and going static.
function ScrollSection({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "start 35%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [46, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.975, 1]);

  if (reduce) {
    return (
      <section ref={ref} style={style}>
        {children}
      </section>
    );
  }

  return (
    <motion.section ref={ref} style={{ ...style, opacity, y, scale }}>
      {children}
    </motion.section>
  );
}

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
  // Extra scroll-tied "pop" layered on top of the reveal fade/rise — a tiny
  // overshoot scale as the pill settles into place, so the stats row feels
  // slightly bouncier/more alive than a flat fade-in. Uses a motion.div so
  // the scroll-driven MotionValue can drive the `scale` transform directly.
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start 98%", "start 60%"] });
  const popScale = useTransform(scrollYProgress, [0, 0.6, 1], [0.9, 1.06, 1]);
  return (
    <motion.div
      ref={node => { (ref as React.RefObject<HTMLDivElement | null>).current = node; scrollRef.current = node; }}
      className="pq-panel"
      style={{
        textAlign: "center",
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 18,
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        scale: reduce ? 1 : popScale,
      }}
    >
      <div className="pq-panel-inner" style={{ padding: "10px 4px" }}>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: "clamp(5px, 1.5vw, 7px)",
          color: "#4a6888", marginBottom: 4, letterSpacing: "0.06em",
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: "clamp(11px, 3vw, 16px)", color: "#c8d8f0",
          borderLeft: "2px solid rgba(124,224,255,0.18)",
          paddingLeft: 6,
        }}>
          {counted}
        </div>
      </div>
    </motion.div>
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


// ─── Press wall — bold, brutalist block grid ───────────────────────────────
// Deliberately loud relative to the rest of the site: thick hard borders, big
// slab outlet names, no soft cards — a "wall" of press clippings, not a quiet
// list. Colors cycle through the zone accent palette so it reads energetic
// without needing new imagery.
const PRESS_ACCENTS = ["#7ce0ff", "#ff9fd4", "#ffd24a", "#00e8a0", "#c89af0", "#ff8a5c"];

function PressSection() {
  const [expanded, setExpanded] = useState(false);
  const visiblePress = expanded ? PRESS : PRESS.slice(0, 6);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 2,
          background: "#0d1a2a",
          border: "3px solid #16233a",
        }}
      >
        {visiblePress.map((p, i) => (
          <PressBlock key={p.url} p={p} i={i} accent={PRESS_ACCENTS[i % PRESS_ACCENTS.length]} />
        ))}
      </div>
      {!expanded && PRESS.length > 6 && (
        <button
          onClick={() => setExpanded(true)}
          className="pq-btn pq-btn-primary"
          style={{
            marginTop: 16, fontSize: 10, padding: "14px 20px",
            width: "100%", justifyContent: "center", letterSpacing: "0.1em",
          }}
        >
          SHOW ALL {PRESS.length} MENTIONS ↓
        </button>
      )}
    </div>
  );
}

// ─── Press block ────────────────────────────────────────────────────────────
function PressBlock({ p, i, accent }: { p: { outlet: string; title: string; url: string }; i: number; accent: string }) {
  const { ref, visible } = useScrollReveal<HTMLAnchorElement>({ threshold: 0.15 });
  return (
    <a
      ref={ref}
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        position: "relative",
        background: "#070d18",
        borderTop: `4px solid ${accent}`,
        padding: "20px 20px 22px",
        textDecoration: "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
        transition: `opacity 0.45s ease ${i * 60}ms, transform 0.45s ease ${i * 60}ms, background 0.15s`,
        minHeight: 132,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${accent}0f`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#070d18"; }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: "var(--font-pixel)", fontSize: 12,
          color: accent, letterSpacing: "0.04em",
          textShadow: `0 0 14px ${accent}55`,
        }}>
          {p.outlet.toUpperCase()}
        </span>
        <span style={{
          fontFamily: "var(--font-pixel)", fontSize: 14, color: accent, opacity: 0.5,
        }}>↗</span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 16, lineHeight: 1.42,
        color: "#d0dcf0", fontWeight: 600,
      }}>
        {p.title}
      </div>
    </a>
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


// ─── Scattered creatures behind the career cards ───────────────────────────
// Individual creature sprites placed around the card stack (not a horizontal
// strip), each with its own scroll-tied parallax drift so they move at a
// different rate than the cards in front of them as you scroll — adds depth
// instead of a flat backdrop.
const CREATURE_SCATTER_POS: { left: string; top: string; size: number; depth: number }[] = [
  { left: "4%",  top: "6%",  size: 64, depth: 60 },
  { left: "88%", top: "14%", size: 52, depth: -40 },
  { left: "10%", top: "34%", size: 46, depth: -55 },
  { left: "84%", top: "46%", size: 68, depth: 45 },
  { left: "6%",  top: "58%", size: 58, depth: 35 },
  { left: "90%", top: "68%", size: 48, depth: -30 },
  { left: "8%",  top: "82%", size: 60, depth: 50 },
  { left: "86%", top: "90%", size: 44, depth: -45 },
];

function ScatteredCreature({
  containerRef,
  url,
  pos,
  index,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  url: string;
  pos: { left: string; top: string; size: number; depth: number };
  index: number;
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-pos.depth, pos.depth]);

  return (
    <motion.img
      src={url}
      alt=""
      aria-hidden
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        width: pos.size,
        height: pos.size,
        imageRendering: "pixelated",
        opacity: 0.16,
        pointerEvents: "none",
        y: reduce ? 0 : y,
        animation: `creature-drift-${index % 9} ${7 + (index % 4) * 1.4}s ease-in-out ${index * 0.5}s infinite alternate`,
      }}
    />
  );
}

// ─── Career section — accordion + zone dividers + backlight ──────────────────
function CareerSection({ zones }: { zones: typeof ZONES }) {
  const [openCards, setOpenCards] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  const aiZone = ZONES.find(z => z.id === "ai")!;
  const cards: { zone: typeof ZONES[0]; overrideId?: string }[] = [];
  for (const z of zones) {
    cards.push({ zone: z });
    if (z.id === "investopad") {
      cards.push({ zone: aiZone, overrideId: "quartic" });
    }
  }

  const handleEnterViewport = (index: number) => {
    setOpenCards(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleLeaveViewport = (_index: number) => {};

  const handleClick = (index: number) => {
    setOpenCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) { next.delete(index); } else { next.add(index); }
      return next;
    });
  };

  const lastOpen = Math.max(-1, ...[...openCards]);
  const currentAccent = lastOpen >= 0 ? cards[lastOpen]?.zone.theme.accent : null;

  return (
    <div ref={sectionRef} style={{ position: "relative" }}>
      <style>{CREATURE_DRIFT_STYLES}</style>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: currentAccent
          ? `radial-gradient(ellipse at 50% 45%, ${currentAccent}14 0%, transparent 55%)`
          : "transparent",
        transition: "background 1.5s ease",
      }} />

      {/* Scattered creatures behind the card stack — scroll-tied parallax */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {CREATURE_SCATTER_POS.map((pos, i) => {
          const zoneWithCreature = zones.filter(z => z.creature)[i % Math.max(1, zones.filter(z => z.creature).length)];
          const url = zoneWithCreature ? CREATURE_URL[zoneWithCreature.id] : undefined;
          if (!url) return null;
          return (
            <ScatteredCreature key={i} containerRef={sectionRef} url={url} pos={pos} index={i} />
          );
        })}
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 48 }}>
        {cards.map((c, i) => (
          <CardScrollWrap key={c.overrideId || c.zone.id} index={i}>
            {openCards.has(i) && (
              <div style={{
                position: "absolute", top: -26, left: 0, right: 0, zIndex: 10,
                display: "flex", alignItems: "center", gap: 12,
                animation: "zone-divider-in 0.5s ease-out",
              }}>
                <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, transparent, ${c.zone.theme.accent}70)` }} />
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: 10,
                  color: c.zone.theme.accent,
                  letterSpacing: "0.15em",
                  textShadow: `0 0 10px ${c.zone.theme.accent}70`,
                  whiteSpace: "nowrap",
                  padding: "4px 14px",
                  background: `${c.zone.theme.accent}0c`,
                  border: `1px solid ${c.zone.theme.accent}30`,
                  borderRadius: 4,
                }}>
                  {(c.overrideId === "quartic" ? "QUARTIC.AI" : c.zone.org).toUpperCase()}
                </span>
                <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${c.zone.theme.accent}70, transparent)` }} />
              </div>
            )}
            <CareerCard
              z={c.zone}
              i={i}
              overrideId={c.overrideId}
              isOpen={openCards.has(i)}
              onEnterViewport={() => handleEnterViewport(i)}
              onLeaveViewport={() => handleLeaveViewport(i)}
              onClick={() => handleClick(i)}
            />
          </CardScrollWrap>
        ))}
      </div>
    </div>
  );
}

// ─── Career card scroll wrapper ────────────────────────────────────────────
// Ties each card's entrance to its own scroll progress through the viewport —
// a slight rise + scale-in as it arrives, independent of the accordion state.
function CardScrollWrap({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 55%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [32, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);
  // Tiny alternating tilt on the way in — settles to dead-straight (0deg) by
  // the time the card is fully in view, just enough to feel playful rather
  // than mechanically identical for every card.
  const tiltFrom = index % 2 === 0 ? -1.4 : 1.4;
  const rotate = useTransform(scrollYProgress, [0, 1], [tiltFrom, 0]);

  if (reduce) {
    return <div ref={ref} style={{ position: "relative" }}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ position: "relative", opacity, y, scale, rotate }}>
      {children}
    </motion.div>
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

const BG_ANIMATIONS = `
.nebula-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.035;
  animation: nebula-float 25s ease-in-out infinite alternate;
  will-change: transform;
}
.nebula-1 { width: 500px; height: 500px; background: #7ce0ff; top: 10%; left: -10%; animation-delay: 0s; }
.nebula-2 { width: 400px; height: 400px; background: #f0c4ff; top: 40%; right: -8%; animation-delay: -8s; }
.nebula-3 { width: 350px; height: 350px; background: #00e8a0; bottom: 15%; left: 20%; animation-delay: -16s; }

@keyframes nebula-float {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
  100% { transform: translate(15px, -10px) scale(1.02); }
}

.bg-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(124, 224, 255, 0.4);
  border-radius: 50%;
  animation: particle-drift 18s ease-in-out infinite alternate;
  will-change: transform, opacity;
}
.particle-0 { animation-duration: 22s; background: rgba(124,224,255,0.3); }
.particle-1 { animation-duration: 18s; background: rgba(240,196,255,0.3); width: 3px; height: 3px; }
.particle-2 { animation-duration: 25s; background: rgba(0,232,160,0.25); }
.particle-3 { animation-duration: 20s; background: rgba(255,210,154,0.3); width: 2px; height: 2px; }
.particle-4 { animation-duration: 16s; background: rgba(124,224,255,0.35); width: 1px; height: 1px; }
.particle-5 { animation-duration: 28s; background: rgba(255,159,212,0.2); width: 3px; height: 3px; }
.particle-6 { animation-duration: 19s; background: rgba(124,224,255,0.25); }
.particle-7 { animation-duration: 24s; background: rgba(168,211,154,0.3); width: 2px; height: 2px; }

@keyframes particle-drift {
  0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
  25% { transform: translate(15px, -25px) scale(1.5); opacity: 0.5; }
  50% { transform: translate(-10px, -50px) scale(0.8); opacity: 0.3; }
  75% { transform: translate(20px, -35px) scale(1.2); opacity: 0.6; }
  100% { transform: translate(-5px, -60px) scale(1); opacity: 0.15; }
}

@keyframes accent-pulse {
  0% { opacity: 0; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.2); }
}

@keyframes zone-divider-in {
  from { opacity: 0; transform: scaleX(0.3); }
  to { opacity: 1; transform: scaleX(1); }
}

/* Mobile: cut heavy blur + halve particle count so scrolling stays buttery */
@media (max-width: 640px) {
  .nebula-blob { filter: blur(42px); opacity: 0.05; }
  .nebula-3 { display: none; }
  .bg-particle:nth-child(even) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .nebula-blob, .bg-particle { animation: none !important; }
}
`;


// ─── Ambient background — scroll-tied parallax ─────────────────────────────
// The nebula blobs already drift on their own CSS-loop timers; layering a
// slow scroll-driven vertical offset on top makes the whole backdrop feel
// tied to how far you've scrolled, not just idling in place underneath the
// content.
function AmbientBackground() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <motion.div className="nebula-blob nebula-1" style={{ y: reduce ? 0 : y1 }} />
      <motion.div className="nebula-blob nebula-2" style={{ y: reduce ? 0 : y2 }} />
      <motion.div className="nebula-blob nebula-3" style={{ y: reduce ? 0 : y3 }} />
      {Array.from({ length: 24 }).map((_, pi) => (
        <div key={pi} className={`bg-particle particle-${pi % 8}`} style={{
          left: `${(pi * 4.2 + 3) % 100}%`,
          top: `${(pi * 7.3 + 10) % 100}%`,
          animationDelay: `${pi * 0.7}s`,
        }} />
      ))}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function HomeClient() {
  const careerZones = ZONES.filter(z => z.id !== "home" && z.id !== "origin");

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #04080f 0%, #070e1a 30%, #0a1428 70%, #0c1830 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{PRESS_START_GLOW}{BG_ANIMATIONS}</style>
      <ScrollProgress />

      {/* Animated background layers */}
      <AmbientBackground />

      {/* ── HERO — cinematic spotlight reveal ── */}
      <SpotlightHero />

      {/* ── STATS ── */}
      <ScrollSection style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
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
      </ScrollSection>

      {/* ── CAREER ── */}
      <ScrollSection style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px", position: "relative", zIndex: 1 }}>
        <SectionHeader text="★ THE CAREER · CHAPTER BY CHAPTER" />
        <CareerSection zones={careerZones} />
      </ScrollSection>

      {/* ── BRAND LOGOS ── */}
      <ScrollSection style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px", position: "relative", zIndex: 1 }}>
        <SectionHeader text="★ BRANDS I WORKED WITH" />
        <BrandLogos />
      </ScrollSection>

      {/* ── PRESS ── */}
      <ScrollSection style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 40px", position: "relative", zIndex: 1 }}>
        <SectionHeader text="★ AS SEEN IN" />
        <PressSection />
      </ScrollSection>

      {/* ── CONTACT ── */}
      <ScrollSection style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px", position: "relative", zIndex: 1 }}>
        <SectionHeader text="★ LET'S TALK" />
        <ContactForm />
      </ScrollSection>

      {/* ── HOW TO PLAY ── */}
      <ScrollSection style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 32px", position: "relative", zIndex: 1 }}>
        <HowToPlay />
      </ScrollSection>

      {/* ── CREATURE STRIP BAND — sendoff lineup, sits right above the footer ── */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "8px 16px 32px", position: "relative", zIndex: 1 }}>
        <CreatureStrip zones={careerZones} />
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
