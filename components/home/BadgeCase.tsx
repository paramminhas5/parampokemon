"use client";
import { useScrollReveal } from "@/lib/useScrollReveal";

type Badge = {
  id: string;
  name: string;
  shape: "hexagon" | "diamond" | "bolt" | "shield" | "starburst" | "circuit" | "crest" | "crown";
  color: string;
  stat: string;
  gym: string;
};

const BADGES: Badge[] = [
  { id: "first-ship", name: "First Ship Badge", shape: "hexagon", color: "#5cc6b8", stat: "Angel-backed, in college", gym: "GetRightPrice" },
  { id: "bootstrapper", name: "Bootstrapper Badge", shape: "diamond", color: "#f5c842", stat: "$120K revenue, zero capital", gym: "Hab Housing" },
  { id: "ai-pioneer", name: "AI Pioneer Badge", shape: "bolt", color: "#5cb8ff", stat: "India's first chatbot, 2013", gym: "Octo → Quartic.ai" },
  { id: "capital-lens", name: "Capital Lens Badge", shape: "shield", color: "#b87cff", stat: "Meesho, Amazon, Forbes in portfolio", gym: "Investopad → Good Capital" },
  { id: "ceo", name: "CEO Badge", shape: "starburst", color: "#ff5c8a", stat: "$6M revenue · $795K raised", gym: "SoleSearch" },
  { id: "ai-native-ops", name: "AI-Native Ops Badge", shape: "circuit", color: "#00e8a0", stat: "CMO, Fere.ai · Ethereal Ventures", gym: "Fere.ai" },
  { id: "creative-sovereignty", name: "Creative Sovereignty Badge", shape: "crest", color: "#ffa64d", stat: "Culture platform · live shows", gym: "Cats Can Dance" },
  { id: "full-stack-operator", name: "Full-Stack Operator Badge", shape: "crown", color: "#4a8cc4", stat: "90-person network · running now", gym: "Iterate" },
];

function BadgeShape({ shape, color, size = 56 }: { shape: Badge["shape"]; color: string; size?: number }) {
  const s = size;
  const half = s / 2;

  switch (shape) {
    case "hexagon":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <polygon
            points="28,4 50,16 50,40 28,52 6,40 6,16"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="2"
          />
          <text x="28" y="32" textAnchor="middle" fill={color} fontSize="16" fontFamily="var(--font-pixel)">★</text>
        </svg>
      );
    case "diamond":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <polygon
            points="28,4 52,28 28,52 4,28"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="2"
          />
          <text x="28" y="33" textAnchor="middle" fill={color} fontSize="14" fontFamily="var(--font-pixel)">◆</text>
        </svg>
      );
    case "bolt":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <polygon
            points="28,2 52,14 48,30 52,30 28,54 30,34 22,34 28,2"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="1.5"
          />
          <text x="28" y="32" textAnchor="middle" fill={color} fontSize="12" fontFamily="var(--font-pixel)">⚡</text>
        </svg>
      );
    case "shield":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <path
            d="M28,4 L48,14 L48,34 C48,44 28,52 28,52 C28,52 8,44 8,34 L8,14 Z"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="2"
          />
          <text x="28" y="34" textAnchor="middle" fill={color} fontSize="14" fontFamily="var(--font-pixel)">◈</text>
        </svg>
      );
    case "starburst":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <polygon
            points="28,2 33,20 52,16 38,28 52,40 33,36 28,54 23,36 4,40 18,28 4,16 23,20"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="1.5"
          />
          <text x="28" y="33" textAnchor="middle" fill={color} fontSize="12" fontFamily="var(--font-pixel)">✦</text>
        </svg>
      );
    case "circuit":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <polygon
            points="28,4 48,16 48,40 28,52 8,40 8,16"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <circle cx="28" cy="28" r="8" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
          <text x="28" y="33" textAnchor="middle" fill={color} fontSize="12" fontFamily="var(--font-pixel)">◎</text>
        </svg>
      );
    case "crest":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <path
            d="M28,4 C34,4 40,8 44,14 C48,20 48,28 46,34 C44,40 38,48 28,52 C18,48 12,40 10,34 C8,28 8,20 12,14 C16,8 22,4 28,4 Z"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="2"
          />
          <text x="28" y="33" textAnchor="middle" fill={color} fontSize="14" fontFamily="var(--font-pixel)">♪</text>
        </svg>
      );
    case "crown":
      return (
        <svg width={s} height={s} viewBox="0 0 56 56">
          <polygon
            points="6,40 6,20 16,28 28,10 40,28 50,20 50,40"
            fill={`${color}20`}
            stroke={color}
            strokeWidth="2"
          />
          <rect x="6" y="40" width="44" height="8" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
          <text x="28" y="34" textAnchor="middle" fill={color} fontSize="10" fontFamily="var(--font-pixel)">♛</text>
        </svg>
      );
  }
}

function BadgeSlot({ badge, index }: { badge: Badge; index: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "16px 8px",
        background: "rgba(10,18,38,0.6)",
        border: `1px solid ${badge.color}25`,
        borderRadius: 6,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.7)",
        transition: `opacity 0.4s ease ${index * 80}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 80}ms`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      className="badge-slot"
    >
      {/* Glow background on hover via CSS */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at center, ${badge.color}15 0%, transparent 70%)`,
        opacity: 0,
        transition: "opacity 0.3s ease",
        pointerEvents: "none",
      }} className="badge-glow" />

      <div style={{ position: "relative", zIndex: 1 }}>
        <BadgeShape shape={badge.shape} color={badge.color} size={badge.id === "ceo" ? 64 : 56} />
      </div>

      <div style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 6,
        color: badge.color,
        textAlign: "center",
        lineHeight: 1.4,
        maxWidth: 90,
        position: "relative",
        zIndex: 1,
      }}>
        {badge.name}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "#5a7a9a",
        textAlign: "center",
        lineHeight: 1.3,
        position: "relative",
        zIndex: 1,
      }}>
        {badge.stat}
      </div>

      <div style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 5,
        color: "#2a3a50",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}>
        {badge.gym}
      </div>
    </div>
  );
}

export function BadgeCase() {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(30,20,10,0.4) 0%, rgba(10,18,38,0.8) 100%)",
      border: "2px solid rgba(120,80,40,0.3)",
      borderRadius: 10,
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Leather texture hint */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(80,50,20,0.03) 2px,
          rgba(80,50,20,0.03) 4px
        )`,
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 9,
        color: "#6a5530",
        textAlign: "center",
        letterSpacing: "0.15em",
        marginBottom: 20,
        position: "relative",
        zIndex: 1,
      }}>
        BADGE CASE · 8 EARNED
      </div>

      {/* Badge grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 10,
        position: "relative",
        zIndex: 1,
      }}>
        {BADGES.map((badge, i) => (
          <BadgeSlot key={badge.id} badge={badge} index={i} />
        ))}
      </div>

      {/* Hover styles */}
      <style>{`
        .badge-slot:hover { border-color: currentColor !important; }
        .badge-slot:hover .badge-glow { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
