"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

const SPOTLIGHT_R = 120;

/**
 * Cinematic hero for the playable portfolio.
 *
 * Two full-bleed layers: a polished futuristic cosmos on top, and the retro
 * pixel game world underneath. A soft spotlight follows the cursor (auto-orbits
 * on touch) and "peels back" the surface to reveal the game hiding beneath —
 * a literal tease that this portfolio is playable.
 */
export function SpotlightHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const smooth = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  useEffect(() => {
    const el = revealRef.current;
    const glow = glowRef.current;
    if (!el) return;

    const hasHover =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let running = true;
    let t = Math.random() * 10;

    const loop = () => {
      if (!running) return;
      const rect = el.getBoundingClientRect();
      const idle = mouse.current.x < -9000;

      if (!hasHover || reduce || idle) {
        // Auto-orbit the spotlight so the reveal is alive without a cursor —
        // kept slow and lazy so it doesn't feel jittery/attention-grabbing.
        t += reduce ? 0 : 0.0028;
        const tx = rect.width / 2 + Math.cos(t) * rect.width * 0.26;
        const ty = rect.height / 2 + Math.sin(t * 1.3) * rect.height * 0.2;
        smooth.current.x += (tx - smooth.current.x) * 0.035;
        smooth.current.y += (ty - smooth.current.y) * 0.035;
      } else {
        smooth.current.x += (mouse.current.x - smooth.current.x) * 0.12;
        smooth.current.y += (mouse.current.y - smooth.current.y) * 0.12;
      }

      const x = smooth.current.x.toFixed(1);
      const y = smooth.current.y.toFixed(1);
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      if (glow) {
        glow.style.transform = `translate(${x}px, ${y}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    // Seed near center so there's an immediate reveal
    const r0 = el.getBoundingClientRect();
    smooth.current = { x: r0.width / 2, y: r0.height / 2 };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduce]);

  const onMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onLeave = () => {
    mouse.current = { x: -9999, y: -9999 };
  };

  const maskGradient = `radial-gradient(circle ${SPOTLIGHT_R}px at var(--mx, -9999px) var(--my, -9999px), #000 0%, #000 40%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.15) 78%, transparent 92%)`;

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        width: "100%",
        height: "70vh",
        minHeight: 480,
        maxHeight: 740,
        overflow: "hidden",
        background: "#03060f",
      }}
    >
      {/* Base layer — modern dark Pokémon-map backdrop */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          scale: bgScale,
          backgroundImage: "url(/hero/hero-cosmos.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.9) contrast(1.03)",
        }}
      />
      {/* Legibility wash over the backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 11,
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(3,6,15,0.2), rgba(3,6,15,0.75) 85%)",
        }}
      />

      {/* Reveal layer — the pixel game world, masked to the spotlight.
          The mask + mouse-tracking math is kept on this outer box (same
          size/position as the section) so the coordinate space stays
          correct; the actual image lives on an oversized inner layer so
          "cover" crops far less aggressively — showing more of the scene
          instead of a zoomed-in sliver of it. */}
      <div
        ref={revealRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          pointerEvents: "none",
          maskImage: maskGradient,
          WebkitMaskImage: maskGradient,
        }}
      >
        {/* Oversized image layer — zoomed out relative to the visible box */}
        <div
          style={{
            position: "absolute",
            top: "-32%",
            bottom: "-32%",
            left: "-12%",
            right: "-12%",
            backgroundImage: "url(/hero/hero-world.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            imageRendering: "pixelated",
            filter: "brightness(1.12) saturate(1.08)",
          }}
        />
        {/* pixel scanlines only inside the reveal — kept subtle so the
            reveal reads as bright/light against the dark backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px)",
          }}
        />
      </div>

      {/* Spotlight rim glow that trails the cursor */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          zIndex: 25,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: SPOTLIGHT_R * 2,
            height: SPOTLIGHT_R * 2,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            boxShadow:
              "0 0 60px 8px rgba(124,224,255,0.18), inset 0 0 40px rgba(124,224,255,0.12)",
            border: "1px solid rgba(124,224,255,0.14)",
          }}
        />
      </div>

      {/* Global grain + top/bottom fade */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(3,6,15,0.5) 0%, transparent 20%, transparent 62%, rgba(4,8,15,0.95) 100%)",
        }}
      />

      {/* Content */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 20px",
          y: contentY,
          opacity: contentOpacity,
          pointerEvents: "none",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 9,
            letterSpacing: "0.32em",
            color: "#7ce0ff",
            textShadow: "0 0 18px rgba(124,224,255,0.6)",
            marginBottom: 12,
          }}
        >
          ★ A PLAYABLE PORTFOLIO
        </motion.div>

        <h1 style={{ margin: 0, lineHeight: 0.92 }}>
          {["PARAM", "MINHAS"].map((word, wi) => (
            <span key={word} style={{ display: "block", overflow: "hidden" }}>
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 0.8,
                  delay: 0.25 + wi * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-pixel)",
                  fontSize: "clamp(28px, 6.5vw, 66px)",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  textShadow:
                    "0 6px 0 rgba(10,32,64,0.9), 0 0 48px rgba(124,224,255,0.45)",
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontFamily: "var(--font-sans, 'Inter', sans-serif)",
            fontSize: "clamp(14px, 2vw, 19px)",
            fontWeight: 500,
            color: "#cfe0f5",
            margin: "16px 0 6px",
            letterSpacing: "0.01em",
          }}
        >
          Builder · Designer · Creative Director
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          style={{
            fontFamily: "var(--font-sans, 'Inter', sans-serif)",
            fontSize: "clamp(11px, 1.6vw, 14px)",
            color: "#7f9ac0",
            margin: 0,
            maxWidth: 520,
            lineHeight: 1.6,
          }}
        >
          Growth &amp; Brand Leadership · GTM · AI-Native Marketing · Product
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 24,
            pointerEvents: "auto",
          }}
        >
          <Link
            href="/play"
            className="pq-btn pq-btn-primary"
            style={{
              fontSize: 13,
              padding: "16px 30px",
              animation: "btn-glow-pulse 2.4s ease-in-out 1.2s infinite",
            }}
          >
            PRESS START <span className="pq-blink">▶</span>
          </Link>
          <Link
            href="/resume"
            className="pq-btn"
            style={{ fontSize: 13, padding: "16px 24px" }}
          >
            READ CV
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue — outer div handles horizontal centering (plain CSS),
          inner motion.div only animates opacity/y. Framer Motion fully owns
          the `transform` style once you animate x/y/scale/etc., so a manual
          `transform: translateX(-50%)` on the same animated element gets
          silently clobbered — splitting into two elements avoids that. */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 8, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 1.4 }}
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: "#7ce0ff",
            letterSpacing: "0.2em",
          }}
        >
          ▼ SCROLL
        </motion.div>
      </div>
    </section>
  );
}
