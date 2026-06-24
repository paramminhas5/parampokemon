import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a2e" },
  header: { marginBottom: 16, borderBottom: "2px solid #1a1a2e", paddingBottom: 12 },
  name: { fontSize: 22, fontWeight: "bold", fontFamily: "Helvetica-Bold", marginBottom: 4 },
  titleLine: { fontSize: 11, color: "#4a4a6a", marginBottom: 3, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 9, color: "#6a6a8a", marginBottom: 10 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, fontSize: 9, color: "#2a4a8a", marginBottom: 12 },
  metricsRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  metricBox: { flex: 1, textAlign: "center", padding: "6px 4px", backgroundColor: "#f8f9fc", borderRadius: 3 },
  metricLabel: { fontSize: 7, color: "#8a8aa0", marginBottom: 2, textTransform: "uppercase" },
  metricValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a1a2e" },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginBottom: 10, marginTop: 16, textTransform: "uppercase" },
  expBlock: { marginBottom: 12, paddingLeft: 10, borderLeft: "2px solid #e0e4ec" },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expRole: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1a1a2e" },
  expCompany: { fontSize: 10, color: "#4a5a7a" },
  expPeriod: { fontSize: 9, color: "#8a8aa0" },
  expMeta: { fontSize: 9, color: "#6a6a8a", marginBottom: 4 },
  bullet: { fontSize: 9.5, color: "#2a2a4a", lineHeight: 1.5, marginBottom: 2, paddingLeft: 8 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillGroup: { width: "48%", marginBottom: 8, padding: 8, backgroundColor: "#f8f9fc", borderRadius: 4 },
  skillGroupTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 3, textTransform: "uppercase" },
  skillGroupItems: { fontSize: 8.5, color: "#4a4a6a", lineHeight: 1.5 },
  pressSection: { fontSize: 9, color: "#2a2a4a", lineHeight: 1.6 },
  openTo: { padding: 12, backgroundColor: "#f0f4ff", borderRadius: 6, marginTop: 12 },
  footer: { fontSize: 8, color: "#8a8aa0", textAlign: "center", marginTop: 20 },
});


const EXPERIENCE = [
  { company: "Iterate", role: "Founder & Creative Director", type: "AI-native marketing agency", period: "Jan 2026 – Present", location: "Bengaluru, India", url: "hyperiterate.com",
    bullets: ["Leads a 90-person network across strategy, creative, and engineering.", "Clients include ChargeZone, Noida International Airport, PickYourTrail, Billione, and Monkspace."],
    sub: { company: "Cats Can Dance", desc: "Culture platform (music, fashion & pet care)", period: "Mar 2026 – Present",
      bullets: ["Designed and built a culture-discovery platform end-to-end — artist directory, event booking, and a music-production learning product.", "Produced a series of live shows pan-India, in partnership with Impresario."] }
  },
  { company: "Fere.ai", role: "CMO", type: "Autonomous AI agent platform, funded by Ethereal Ventures", period: "Jan 2025 – Dec 2025", location: "India", url: "fereai.xyz",
    bullets: ["Joined early to build the growth and marketing function, rejoining long-time collaborator Akshaya Aron.", "Restructured marketing to run lean — sustained by AI systems and a small team.", "Used that operating model as the proving ground for launching Iterate."] },
  { company: "SoleSearch", role: "Founder & CEO", type: "Sneaker, streetwear & collectibles marketplace", period: "2022 – Dec 2024", location: "India",
    bullets: ["Founded SoleSearch; joined by Prabal Baghla and Rannvijay Singha. Led a team of 40. Raised $795K from Venture Catalysts, Anthill Ventures, and Cornerstone Ventures.", "Generated $6M+ in total revenue over four years, with omnichannel retail in Mumbai and Hyderabad.", "Built a 350,000+ follower community and ran 30+ live events, including SneakinOut — India's first sneaker convention.", "Secured press in VICE, CNBC-TV18, Storyboard18, Economic Times, Inc42, and Business of Fashion."] },
  { company: "Investopad → Good Capital", role: "Partner, Growth & Technology", type: "Family office turned venture fund", period: "2017 – 2020", location: "New Delhi, India",
    bullets: ["Partner for Tech & Growth as family office evolved into Good Capital, an institutional Fund I.", "Helped build the fund — sourcing, diligence, founder support — for a portfolio including Meesho, Entri, Simsim, Amazon, and Forbes."] },
  { company: "Quartic.ai", role: "Director of Marketing", type: "Enterprise AI platform", period: "2020 – 2022", location: "San Jose, CA (HQ)",
    bullets: ["Led a team of 5. Backed by Good Capital, Celesta Capital, and Michael Marks.", "Built the marketing function from zero: brand identity, website, collateral, and press strategy."] },
  { company: "Octo", role: "Founding Team, Head of Growth", type: "Conversational AI platform, acquired by Quartic.ai", period: "2016 – 2017", location: "New Delhi, India",
    bullets: ["Co-built with Akshaya Aron, backed by Good Capital — built AI products before \"AI\" was a market category.", "Built and ran the entire marketing function from scratch and rebuilt the product dashboard end-to-end."] },
  { company: "Hab Housing", role: "Founder", type: "Branded budget hospitality", period: "2012 – 2015", location: "Pune, India",
    bullets: ["Built one of India's first branded budget-hospitality startups — the category OYO later scaled nationally.", "$120K+ in revenue, fully bootstrapped. Grew from sole founder to a 16-person team across three cities."] },
  { company: "GetRightPrice", role: "Founding Team Member", type: "India's first price-comparison engine", period: "2011 – 2012", location: "Delhi, India",
    bullets: ["Joined the founding team in college, angel-backed by Sidharth Rao (founder, Webchutney). Built the product catalog and crawl pipeline."] },
];


const SKILLS = [
  { group: "Growth & Marketing", items: "Go-to-market strategy, Demand generation, Performance marketing, SEO & GEO, Community building, Event marketing" },
  { group: "Brand & Creative", items: "Brand identity systems, Creative direction, Copywriting, PR & press strategy" },
  { group: "Strategy", items: "Positioning, ICP definition, Pricing & packaging, Fundraising, GTM planning" },
  { group: "AI & Engineering", items: "AI-native marketing, Conversational AI & agent development, Full-stack web (Next.js, React), Prompt engineering, Data pipelines" },
  { group: "Leadership", items: "Team building (5 to 90+), Hiring, Founder coaching" },
  { group: "Tools", items: "Notion, Linear, Figma, Cursor, Claude, Webflow, Shopify, Meta/Google Ads, GA4, n8n, Zapier" },
];

function FullResumePDF() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>PARAM MINHAS</Text>
          <Text style={styles.titleLine}>Founder & Creative Director</Text>
          <Text style={styles.subtitle}>Growth & Brand Leadership | GTM | AI-Native Marketing | Creative Direction | Product</Text>
          <View style={styles.contactRow}>
            <Link src="mailto:minhas.param@gmail.com"><Text>minhas.param@gmail.com</Text></Link>
            <Link src="https://linkedin.com/in/paramminhas"><Text>linkedin.com/in/paramminhas</Text></Link>
            <Link src="https://catscandance.com"><Text>catscandance.com</Text></Link>
            <Text>Bengaluru, India</Text>
          </View>
          <View style={styles.metricsRow}>
            {[
              { l: "Experience", v: "15+ Years" }, { l: "Revenue", v: "$6M+" },
              { l: "Community", v: "350K+" }, { l: "Network", v: "90-Person" }, { l: "Raised", v: "$795K" },
            ].map(m => (
              <View key={m.l} style={styles.metricBox}>
                <Text style={styles.metricLabel}>{m.l}</Text>
                <Text style={styles.metricValue}>{m.v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={{ fontSize: 9.5, lineHeight: 1.6, color: "#2a2a4a", marginBottom: 4 }}>
          Founder and creative director who builds growth, brand, and marketing functions from zero, then ships the product underneath them. Operator across the full GTM stack with a rare engineering hand: built AI products before "AI" was a category, co-building one of India&apos;s first conversational AI platforms in 2013. Has led teams from 5 to 90+. Built one company to $6M+ in revenue and a 350,000+ community on a $795K raise; now runs an AI-native marketing agency serving clients including a national airport and a national EV charging network.
        </Text>

        {/* Experience */}
        <Text style={styles.sectionTitle}>Experience</Text>
        {EXPERIENCE.map((exp, i) => (
          <View key={i} style={styles.expBlock} wrap={false}>
            <View style={styles.expHeader}>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text style={styles.expRole}>{exp.role}</Text>
                <Text style={styles.expCompany}> — {exp.company}</Text>
              </View>
              <Text style={styles.expPeriod}>{exp.period}</Text>
            </View>
            <Text style={styles.expMeta}>{exp.type} | {exp.location}{exp.url ? ` | ${exp.url}` : ""}</Text>
            {exp.bullets.map((b, bi) => (
              <Text key={bi} style={styles.bullet}>• {b}</Text>
            ))}
            {exp.sub && (
              <View style={{ marginTop: 6, paddingLeft: 8, borderLeft: "1px solid #e8e8ec" }}>
                <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>{exp.sub.company} — {exp.sub.desc} | {exp.sub.period}</Text>
                {exp.sub.bullets.map((b, bi) => (
                  <Text key={bi} style={styles.bullet}>• {b}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Skills */}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsGrid}>
          {SKILLS.map(sg => (
            <View key={sg.group} style={styles.skillGroup}>
              <Text style={styles.skillGroupTitle}>{sg.group}</Text>
              <Text style={styles.skillGroupItems}>{sg.items}</Text>
            </View>
          ))}
        </View>

        {/* Education */}
        <Text style={styles.sectionTitle}>Education</Text>
        <Text style={{ fontSize: 9.5, color: "#2a2a4a", lineHeight: 1.5 }}>
          Self-taught across software, design, and music production since before 2010. Shipped first commercial product at 19; founded first company at 21.
        </Text>

        {/* Press */}
        <Text style={styles.sectionTitle}>Press & Recognition</Text>
        <View style={styles.pressSection}>
          <Text>Major features: VICE, Storyboard18 (syndicated to Forbes India), CNBC-TV18, The Established</Text>
          <Text>Funding coverage: Economic Times, Entrackr, Indian Retailer, YourStory</Text>
          <Text>Profiles: CB Insights, Crunchbase, PitchBook</Text>
        </View>

        {/* Open To */}
        <View style={styles.openTo}>
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>OPEN TO</Text>
          <Text style={{ fontSize: 9, color: "#2a2a4a", lineHeight: 1.5 }}>
            Senior operating and CMO-track roles, fractional/advisory mandates, and operator-investor partnerships — at AI-native, brand-led, or culture-driven companies.
          </Text>
        </View>

        <Text style={styles.footer}>minhas.param@gmail.com | linkedin.com/in/paramminhas | hyperiterate.com | catscandance.com</Text>
      </Page>
    </Document>
  );
}

export async function GET() {
  const buffer = await renderToBuffer(<FullResumePDF />);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Param_Minhas_Resume.pdf"',
    },
  });
}
