import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a2e" },
  header: { marginBottom: 14, borderBottom: "2px solid #1a1a2e", paddingBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold", fontFamily: "Helvetica-Bold", marginBottom: 3 },
  titleLine: { fontSize: 10, color: "#4a4a6a", marginBottom: 2, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 8.5, color: "#6a6a8a", marginBottom: 8 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, fontSize: 8.5, color: "#2a4a8a", marginBottom: 10 },
  metricsRow: { flexDirection: "row", gap: 6 },
  metricBox: { flex: 1, textAlign: "center", padding: "5px 3px", backgroundColor: "#f8f9fc", borderRadius: 3 },
  metricLabel: { fontSize: 6.5, color: "#8a8aa0", marginBottom: 1, textTransform: "uppercase" },
  metricValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#1a1a2e" },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", letterSpacing: 0.8, marginBottom: 8, marginTop: 12, textTransform: "uppercase" },
  expBlock: { marginBottom: 10, paddingLeft: 8, borderLeft: "2px solid #e0e4ec" },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
  expRole: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1a1a2e" },
  expCompany: { fontSize: 9.5, color: "#4a5a7a" },
  expPeriod: { fontSize: 8.5, color: "#8a8aa0" },
  expMeta: { fontSize: 8.5, color: "#6a6a8a", marginBottom: 3 },
  bullet: { fontSize: 9, color: "#2a2a4a", lineHeight: 1.5, marginBottom: 1.5, paddingLeft: 6 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  skillGroup: { width: "48%", marginBottom: 6, padding: 6, backgroundColor: "#f8f9fc", borderRadius: 3 },
  skillGroupTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", marginBottom: 2, textTransform: "uppercase" },
  skillGroupItems: { fontSize: 8, color: "#4a4a6a", lineHeight: 1.4 },
  openTo: { padding: 10, backgroundColor: "#f0f4ff", borderRadius: 5, marginTop: 10 },
  footer: { fontSize: 7.5, color: "#8a8aa0", textAlign: "center", marginTop: 14 },
});

function OnePageResumePDF() {
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

        {/* Summary — 3 sentences */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={{ fontSize: 9, lineHeight: 1.5, color: "#2a2a4a", marginBottom: 4 }}>
          Founder and creative director who builds growth, brand, and marketing functions from zero. Built one company to $6M+ in revenue and a 350K+ community on a $795K raise. Now runs an AI-native marketing agency (90-person network) serving national-scale clients.
        </Text>


        {/* 3 Key Roles */}
        <Text style={styles.sectionTitle}>Key Experience</Text>

        {/* Iterate */}
        <View style={styles.expBlock}>
          <View style={styles.expHeader}>
            <View style={{ flexDirection: "row", gap: 3 }}>
              <Text style={styles.expRole}>Founder & Creative Director</Text>
              <Text style={styles.expCompany}> — Iterate</Text>
            </View>
            <Text style={styles.expPeriod}>2024 – Present</Text>
          </View>
          <Text style={styles.expMeta}>AI-native marketing agency | Bengaluru | hyperiterate.com</Text>
          <Text style={styles.bullet}>• Leads a 90-person network across strategy, creative, and engineering.</Text>
          <Text style={styles.bullet}>• Clients: ChargeZone, Noida International Airport, PickYourTrail, Billione, Monkspace.</Text>
          <Text style={styles.bullet}>• Launched Cats Can Dance — culture-discovery platform with live shows (Impresario partnership).</Text>
        </View>

        {/* SoleSearch */}
        <View style={styles.expBlock}>
          <View style={styles.expHeader}>
            <View style={{ flexDirection: "row", gap: 3 }}>
              <Text style={styles.expRole}>Co-Founder & CEO</Text>
              <Text style={styles.expCompany}> — SoleSearch</Text>
            </View>
            <Text style={styles.expPeriod}>2020 – 2024</Text>
          </View>
          <Text style={styles.expMeta}>Sneaker, streetwear & collectibles marketplace | India</Text>
          <Text style={styles.bullet}>• $6M+ total revenue, $795K raised (Venture Catalysts, Anthill, Cornerstone). Team of 40.</Text>
          <Text style={styles.bullet}>• 350K+ community, 30+ events incl. SneakinOut — India's first sneaker convention.</Text>
          <Text style={styles.bullet}>• Press: VICE, CNBC-TV18, Business of Fashion, Economic Times, Inc42.</Text>
        </View>

        {/* Fere.ai */}
        <View style={styles.expBlock}>
          <View style={styles.expHeader}>
            <View style={{ flexDirection: "row", gap: 3 }}>
              <Text style={styles.expRole}>CMO</Text>
              <Text style={styles.expCompany}> — Fere.ai</Text>
            </View>
            <Text style={styles.expPeriod}>2024 – 2025</Text>
          </View>
          <Text style={styles.expMeta}>Autonomous AI agent platform | Funded by Ethereal Ventures | fereai.xyz</Text>
          <Text style={styles.bullet}>• Built growth function from scratch. Restructured to run lean on AI systems.</Text>
          <Text style={styles.bullet}>• Operating model became proving ground for launching Iterate.</Text>
        </View>

        {/* Also */}
        <View style={{ marginTop: 6, marginBottom: 2 }}>
          <Text style={{ fontSize: 8.5, color: "#4a4a6a", fontFamily: "Helvetica-Bold", marginBottom: 4 }}>ALSO:</Text>
          <Text style={{ fontSize: 8.5, color: "#2a2a4a", lineHeight: 1.5 }}>
            Partner, Growth & Technology at Investopad → Good Capital (2017–20, portfolio incl. Meesho) · Director of Marketing at Quartic.ai (2019–20) · Founding Team, Head of Growth at Octo (2013–17, acq. by Quartic) · Founder, Hab Housing (2012–13, $120K bootstrapped) · Founding Team, GetRightPrice (2010–11, angel-backed)
          </Text>
        </View>


        {/* Skills compact */}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsRow}>
          {[
            { group: "Growth & Marketing", items: "GTM, Demand gen, Performance, SEO/GEO, Community, Events" },
            { group: "Brand & Creative", items: "Identity systems, Creative direction, Copywriting, PR" },
            { group: "Strategy", items: "Positioning, ICP, Pricing, Fundraising, GTM planning" },
            { group: "AI & Engineering", items: "AI-native marketing, Agents, Next.js/React, Prompting" },
            { group: "Leadership", items: "Team building (5–90+), Hiring, Founder coaching" },
            { group: "Tools", items: "Notion, Linear, Figma, Cursor, Claude, Webflow, Shopify, Ads" },
          ].map(sg => (
            <View key={sg.group} style={styles.skillGroup}>
              <Text style={styles.skillGroupTitle}>{sg.group}</Text>
              <Text style={styles.skillGroupItems}>{sg.items}</Text>
            </View>
          ))}
        </View>

        {/* Press */}
        <Text style={{ fontSize: 8.5, color: "#4a4a6a", marginTop: 6 }}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>Press: </Text>
          VICE · CNBC-TV18 · Business of Fashion · Storyboard18/Forbes India · Economic Times · Inc42 · YourStory
        </Text>

        {/* Open To */}
        <View style={styles.openTo}>
          <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>OPEN TO</Text>
          <Text style={{ fontSize: 8.5, color: "#2a2a4a", lineHeight: 1.4 }}>
            Senior operating and CMO-track roles, fractional/advisory mandates, and operator-investor partnerships — at AI-native, brand-led, or culture-driven companies.
          </Text>
        </View>

        <Text style={styles.footer}>minhas.param@gmail.com | linkedin.com/in/paramminhas | hyperiterate.com | catscandance.com</Text>
      </Page>
    </Document>
  );
}

export async function GET() {
  const buffer = await renderToBuffer(<OnePageResumePDF />);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Param_Minhas_1Pager.pdf"',
    },
  });
}
