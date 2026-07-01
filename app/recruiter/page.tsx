import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recruiter Quick View — Param Minhas | 60-Second Career Overview",
  description: "The fast-track view for recruiters: 15 years, $6M+ revenue, 350K+ community, 90-person network. See it all in 60 seconds or download the full CV.",
  alternates: { canonical: "https://paramminhas.com/recruiter" },
  openGraph: {
    title: "Recruiter Quick View — Param Minhas",
    description: "60-second career speed run. Founder of Iterate, CEO of SoleSearch, CMO at Fere.ai, Partner at Good Capital.",
    type: "profile",
    url: "https://paramminhas.com/recruiter",
  },
};

const HIGHLIGHTS = [
  { org: "Iterate", role: "Founder & Creative Director", period: "2026–Present", metric: "90-person network", accent: "#7ce0ff" },
  { org: "Fere.ai", role: "CMO", period: "2025", metric: "AI agent platform", accent: "#00e8a0" },
  { org: "SoleSearch", role: "Founder & CEO", period: "2022–2024", metric: "$6M+ revenue", accent: "#ff9fd4" },
  { org: "Quartic.ai", role: "Director of Marketing", period: "2020–2022", metric: "Enterprise AI", accent: "#9fe8ff" },
  { org: "Good Capital", role: "Partner, Growth & Tech", period: "2017–2020", metric: "Meesho, Entri, Simsim", accent: "#f0c4ff" },
  { org: "Octo", role: "Founding Team", period: "2016–2017", metric: "India's first chatbot", accent: "#a8d39a" },
  { org: "Hab Housing", role: "Founder", period: "2012–2015", metric: "$120K bootstrapped", accent: "#f6a268" },
  { org: "GetRightPrice", role: "Founding Team", period: "2011–2012", metric: "India's first price comparison", accent: "#f5b78a" },
];

export default function RecruiterPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #04080f 0%, #070e1a 50%, #0a1428 100%)",
      color: "#c8d8f0",
      fontFamily: "'Space Mono', monospace",
    }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(4,8,15,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a2a4a",
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <Link href="/" style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: "#4a6080", textDecoration: "none",
          padding: "6px 12px", border: "1px solid #1a2a4a",
        }}>← HOME</Link>
        <Link href="/play" style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: "#7ce0ff", textDecoration: "none",
          padding: "6px 12px", border: "1px solid rgba(124,224,255,0.3)",
          background: "rgba(124,224,255,0.08)",
        }}>▶ PLAY FULL GAME</Link>
        <a href="/api/resume-pdf" style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: "#4ade80", textDecoration: "none",
          padding: "6px 12px", border: "1px solid rgba(74,222,128,0.3)",
          background: "rgba(74,222,128,0.08)",
        }}>⬇ FULL PDF</a>
        <a href="/api/resume-1p" style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: "#ffd24a", textDecoration: "none",
          padding: "6px 12px", border: "1px solid rgba(255,210,74,0.3)",
          background: "rgba(255,210,74,0.08)",
        }}>⬇ 1-PAGER</a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px 64px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 7,
            color: "#3a5a80", letterSpacing: "0.3em", marginBottom: 16,
          }}>⚡ RECRUITER QUICK VIEW</div>
          <h1 style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "clamp(24px, 6vw, 42px)",
            color: "#7ce0ff", margin: "0 0 12px",
            textShadow: "0 4px 0 #0a2040",
            lineHeight: 1.2,
          }}>PARAM MINHAS</h1>
          <p style={{ fontSize: 16, color: "#8aa0c0", margin: "0 0 8px" }}>
            Builder · Designer · Creative Director
          </p>
          <p style={{ fontSize: 13, color: "#4a6080", margin: 0 }}>
            Bengaluru, India · minhas.param@gmail.com · linkedin.com/in/paramminhas
          </p>
        </header>

        {/* Stats strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 8, marginBottom: 48,
        }}>
          {[
            { label: "YEARS", value: "15+", color: "#7ce0ff" },
            { label: "REVENUE", value: "$6M+", color: "#4ade80" },
            { label: "COMMUNITY", value: "350K+", color: "#ff9fd4" },
            { label: "NETWORK LED", value: "90+", color: "#ffd24a" },
            { label: "RAISED", value: "$795K", color: "#f0c4ff" },
          ].map(s => (
            <div key={s.label} style={{
              textAlign: "center", padding: "14px 8px",
              background: "rgba(4,8,20,0.6)",
              border: `1px solid ${s.color}30`,
            }}>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#4a6888", marginBottom: 6, letterSpacing: "0.1em" }}>{s.label}</div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 9,
          color: "#3a5a80", letterSpacing: "0.15em", marginBottom: 24, textAlign: "center",
        }}>★ CAREER TIMELINE</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} style={{
              display: "flex", gap: 16, alignItems: "center",
              padding: "16px 20px",
              background: "rgba(4,8,20,0.6)",
              border: `1px solid ${h.accent}30`,
              borderLeft: `4px solid ${h.accent}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: h.accent }}>{h.org}</span>
                  <span style={{ fontSize: 12, color: "#4a6888" }}>{h.period}</span>
                </div>
                <div style={{ fontSize: 14, color: "#8aa0c0" }}>{h.role}</div>
              </div>
              <div style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                color: h.accent, opacity: 0.8,
                textAlign: "right", flexShrink: 0,
              }}>{h.metric}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 48, textAlign: "center",
          padding: "32px 24px",
          background: "rgba(124,224,255,0.04)",
          border: "1px solid rgba(124,224,255,0.15)",
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8,
            color: "#7ce0ff", letterSpacing: "0.1em", marginBottom: 16,
          }}>OPEN TO</div>
          <p style={{ fontSize: 14, color: "#8aa0c0", margin: "0 0 20px", lineHeight: 1.6 }}>
            Senior operating and CMO-track roles, fractional/advisory mandates,
            and operator-investor partnerships at AI-native, brand-led, or culture-driven companies.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:minhas.param@gmail.com" style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#7ce0ff", textDecoration: "none",
              padding: "12px 24px", border: "2px solid #7ce0ff",
              background: "rgba(124,224,255,0.1)",
            }}>EMAIL PARAM →</a>
            <a href="https://linkedin.com/in/paramminhas" target="_blank" rel="noreferrer" style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              color: "#8aa0c0", textDecoration: "none",
              padding: "12px 24px", border: "2px solid #2a4060",
            }}>LINKEDIN</a>
          </div>
        </div>
      </div>
    </div>
  );
}
