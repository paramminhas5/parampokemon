"use client";
import { useState, useEffect } from "react";

export function ResumeThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pq_resume_theme");
      if (saved === "dark") setDark(true);
    } catch {}
  }, []);

  useEffect(() => {
    const el = document.getElementById("resume-root");
    if (!el) return;
    if (dark) {
      el.classList.add("resume-dark");
      el.classList.remove("resume-light");
    } else {
      el.classList.remove("resume-dark");
      el.classList.add("resume-light");
    }
    try { localStorage.setItem("pq_resume_theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 16px",
        background: dark ? "rgba(124,224,255,0.1)" : "#f0f4ff",
        color: dark ? "#7ce0ff" : "#4a5a8a",
        border: dark ? "1.5px solid rgba(124,224,255,0.3)" : "1.5px solid #d0d8e8",
        fontSize: 11, fontFamily: "'Press Start 2P', monospace",
        cursor: "pointer", borderRadius: 4,
        letterSpacing: "0.03em",
        transition: "all 0.2s",
      }}
    >
      {dark ? "☀ LIGHT" : "★ QUEST"}
    </button>
  );
}
