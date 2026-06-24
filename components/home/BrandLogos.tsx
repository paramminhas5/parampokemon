"use client";
import { useScrollReveal } from "@/lib/useScrollReveal";

type BrandItem = {
  name: string;
  domain?: string; // for clearbit logo
  url?: string;
};

const CURRENT_CLIENTS: BrandItem[] = [
  { name: "ChargeZone", domain: "chargezone.com", url: "https://chargezone.com" },
  { name: "Noida International Airport", domain: "niiairport.com", url: "https://niiairport.com" },
  { name: "PickYourTrail", domain: "pickyourtrail.com", url: "https://pickyourtrail.com" },
  { name: "Billione", domain: "billione.com" },
  { name: "Monkspace", domain: "monkspace.in" },
];

const BUILT_BACKED: BrandItem[] = [
  { name: "Meesho", domain: "meesho.com", url: "https://meesho.com" },
  { name: "Fere.ai", domain: "fereai.xyz", url: "https://fereai.xyz" },
  { name: "Quartic.ai", domain: "quartic.ai", url: "https://quartic.ai" },
  { name: "SoleSearch", domain: "solesearch.in" },
  { name: "Good Capital", domain: "goodcap.co" },
];

const FEATURED_IN: BrandItem[] = [
  { name: "VICE", domain: "vice.com", url: "https://vice.com" },
  { name: "CNBC-TV18", domain: "cnbctv18.com", url: "https://cnbctv18.com" },
  { name: "Business of Fashion", domain: "businessoffashion.com", url: "https://businessoffashion.com" },
  { name: "Economic Times", domain: "economictimes.com", url: "https://economictimes.indiatimes.com" },
  { name: "Inc42", domain: "inc42.com", url: "https://inc42.com" },
  { name: "Forbes India", domain: "forbesindia.com", url: "https://forbesindia.com" },
];

function BrandLogo({ brand, index, accent }: { brand: BrandItem; index: number; accent: string }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  const logoUrl = brand.domain
    ? `https://logo.clearbit.com/${brand.domain}`
    : null;

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 16px",
        background: "rgba(10,18,38,0.5)",
        border: "1px solid rgba(42,58,80,0.4)",
        borderRadius: 6,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms`,
        minHeight: 48,
        cursor: brand.url ? "pointer" : "default",
      }}
      onClick={() => brand.url && window.open(brand.url, "_blank")}
      title={brand.name}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={brand.name}
          style={{
            height: 24,
            maxWidth: 100,
            objectFit: "contain",
            filter: "brightness(0.9) contrast(1.1)",
          }}
          onError={(e) => {
            // Fallback to text if logo fails
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement("span");
              fallback.textContent = brand.name;
              fallback.style.fontFamily = "var(--font-pixel)";
              fallback.style.fontSize = "7px";
              fallback.style.color = accent;
              fallback.style.letterSpacing = "0.05em";
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <span style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 7,
          color: accent,
          letterSpacing: "0.05em",
          textAlign: "center",
        }}>
          {brand.name}
        </span>
      )}
    </div>
  );
}

function BrandRow({ title, brands, accent }: { title: string; brands: BrandItem[]; accent: string }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div ref={ref} style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: "var(--font-pixel)",
        fontSize: 7,
        color: "#4a6888",
        letterSpacing: "0.12em",
        marginBottom: 10,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        {title}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: 8,
      }}>
        {brands.map((brand, i) => (
          <BrandLogo key={brand.name} brand={brand} index={i} accent={accent} />
        ))}
      </div>
    </div>
  );
}

export function BrandLogos() {
  return (
    <div className="pq-panel">
      <div className="pq-panel-inner" style={{ padding: "20px 16px" }}>
        <BrandRow title="★ CURRENT CLIENTS" brands={CURRENT_CLIENTS} accent="#7ce0ff" />
        <BrandRow title="★ BUILT & BACKED" brands={BUILT_BACKED} accent="#f0c4ff" />
        <BrandRow title="★ FEATURED IN" brands={FEATURED_IN} accent="#ffd29a" />
      </div>
    </div>
  );
}
