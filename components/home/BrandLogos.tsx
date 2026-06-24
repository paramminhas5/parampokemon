"use client";
import { useScrollReveal } from "@/lib/useScrollReveal";

type BrandItem = {
  name: string;
  domain?: string;
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
  { name: "Fere.ai", domain: "fereai.xyz", url: "https://www.fereai.xyz/app" },
  { name: "Quartic.ai", domain: "quartic.ai", url: "https://www.quartic.ai" },
  { name: "SoleSearch" },
  { name: "Good Capital", domain: "goodcap.co" },
];

const PARTNERED_WITH: BrandItem[] = [
  { name: "Royal Enfield", domain: "royalenfield.com", url: "https://www.royalenfield.com" },
  { name: "Casa Bacardi", domain: "bacardi.com", url: "https://www.bacardi.com" },
  { name: "boAt", domain: "boat-lifestyle.com", url: "https://www.boat-lifestyle.com" },
  { name: "Swiggy SteppinOut", domain: "swiggy.com", url: "https://www.swiggy.com" },
  { name: "Rapport", domain: "rapportthebrand.com" },
  { name: "Gully Gang", domain: "gullygangindia.com" },
];

const FEATURED_IN: BrandItem[] = [
  { name: "VICE", domain: "vice.com", url: "https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/" },
  { name: "CNBC-TV18", domain: "cnbctv18.com", url: "https://cnbctv18.com" },
  { name: "Business of Fashion", domain: "imagesbof.in", url: "https://www.imagesbof.in" },
  { name: "Economic Times", domain: "economictimes.indiatimes.com", url: "https://economictimes.indiatimes.com" },
  { name: "Storyboard18", domain: "storyboard18.com", url: "https://www.storyboard18.com" },
  { name: "Forbes India", domain: "forbesindia.com", url: "https://forbesindia.com" },
];

// img.logo.dev renders clean PNG logos by domain
const LOGO_TOKEN = "pk_a8JjRklcTcKMFIy0bbCHSA";

function BrandLogo({ brand, index, accent }: { brand: BrandItem; index: number; accent: string }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  const logoUrl = brand.domain
    ? `https://img.logo.dev/${brand.domain}?token=${LOGO_TOKEN}`
    : null;

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 16px",
        background: "rgba(10,18,38,0.5)",
        border: "1px solid rgba(42,58,80,0.4)",
        borderRadius: 6,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.4s ease ${index * 50}ms, transform 0.4s ease ${index * 50}ms`,
        minHeight: 52,
        cursor: brand.url ? "pointer" : "default",
      }}
      onClick={() => brand.url && window.open(brand.url, "_blank")}
      title={brand.name}
    >
      {logoUrl ? (
        <>
          <img
            src={logoUrl}
            alt={brand.name}
            style={{
              height: 28,
              maxWidth: 110,
              objectFit: "contain",
              filter: "brightness(0.95) contrast(1.05)",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = "block";
              }
            }}
          />
          {/* Text fallback — hidden unless image fails */}
          <span style={{
            display: "none",
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: accent,
            letterSpacing: "0.05em",
            textAlign: "center",
            lineHeight: 1.3,
          }}>
            {brand.name}
          </span>
        </>
      ) : (
        <span style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 7,
          color: accent,
          letterSpacing: "0.05em",
          textAlign: "center",
          lineHeight: 1.3,
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
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
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
        <BrandRow title="★ PARTNERED WITH" brands={PARTNERED_WITH} accent="#ff9fd4" />
        <BrandRow title="★ FEATURED IN" brands={FEATURED_IN} accent="#ffd29a" />
      </div>
    </div>
  );
}
