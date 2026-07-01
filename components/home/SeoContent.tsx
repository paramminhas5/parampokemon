/**
 * Server-side rendered SEO content for homepage.
 * 
 * This component renders semantic HTML that search engines and AI crawlers can index.
 * It's visually hidden but fully accessible to crawlers, providing all the career
 * information that the client-side interactive homepage displays.
 * 
 * This is critical because the main homepage is a "use client" component,
 * meaning its content is not available in the initial HTML response.
 */
export function SeoContent() {
  return (
    <div
      aria-hidden="false"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
      }}
    >
      <article itemScope itemType="https://schema.org/Person">
        {/* Speakable-optimized blocks — 50-100 word declarative statements for AI/voice citation */}
        <div id="speakable-summary">
          Param Minhas is a founder, creative director, and growth operator based in Bengaluru, India with fifteen years of experience. He currently runs Iterate, an AI-native marketing agency with a ninety-person network, and Cats Can Dance, a culture-discovery platform. He previously served as CEO of SoleSearch where he generated over six million dollars in revenue and built a community of three hundred fifty thousand people.
        </div>
        <div id="speakable-current">
          Iterate is an AI-native marketing agency founded by Param Minhas in January twenty twenty-six. The agency operates with a ninety-person network across strategy, creative, and engineering. Current clients include ChargeZone, Noida International Airport, PickYourTrail, Billione, and Monkspace. The agency website is hyperiterate dot com.
        </div>
        <div id="speakable-known-for">
          Param Minhas is known for building companies from zero without inheriting momentum. He built one of India&apos;s first conversational AI platforms in twenty thirteen, created India&apos;s sneaker culture through SoleSearch, and pioneered AI-native marketing where AI systems replace headcount rather than just augmenting it. His career breadth across industries is deliberate, with each chapter compounding on the last.
        </div>

        <h1 itemProp="name">Param Minhas</h1>
        <p itemProp="jobTitle">Founder & Creative Director</p>
        <p itemProp="description">
          Builder, designer, and creative director with 15+ years across e-commerce, AI,
          real estate, sneakers, music, and AI-native marketing. Currently running Iterate —
          an AI-native marketing agency with a 90-person network — and Cats Can Dance,
          a culture-discovery platform. Based in Bengaluru, India.
        </p>

        <section>
          <h2>Key Metrics</h2>
          <ul>
            <li>15+ years building products, brands, and companies</li>
            <li>$6M+ total revenue generated (SoleSearch)</li>
            <li>350,000+ community built</li>
            <li>90-person network led (Iterate)</li>
            <li>$795K raised (Venture Catalysts, Anthill Ventures, Cornerstone Ventures)</li>
            <li>30+ live events produced</li>
            <li>4 companies founded/co-founded</li>
          </ul>
        </section>

        <section>
          <h2>Current Roles</h2>
          <div itemProp="worksFor" itemScope itemType="https://schema.org/Organization">
            <h3><span itemProp="name">Iterate</span> — Founder & Creative Director (Jan 2026 – Present)</h3>
            <p itemProp="description">
              AI-native marketing agency with a 90-person network across strategy, creative,
              and engineering. Clients include ChargeZone, Noida International Airport,
              PickYourTrail, Billione, and Monkspace.
            </p>
            <a itemProp="url" href="https://hyperiterate.com">hyperiterate.com</a>
          </div>

          <div itemScope itemType="https://schema.org/Organization">
            <h3><span itemProp="name">Cats Can Dance</span> — Founder (Mar 2026 – Present)</h3>
            <p itemProp="description">
              Culture-discovery platform spanning music, fashion, and pet care.
              Artist directory, event booking, and music-production learning product.
              Produced series of live shows pan-India in partnership with Impresario.
            </p>
            <a itemProp="url" href="https://catscandance.com">catscandance.com</a>
          </div>
        </section>

        <section>
          <h2>Career History</h2>

          <div>
            <h3>Fere.ai — CMO (Jan 2025 – Dec 2025)</h3>
            <p>
              Autonomous AI agent platform funded by Ethereal Ventures ($1.3M raised).
              Rejoined long-time collaborator Akshaya Aron. Built growth and marketing
              function from scratch. Restructured marketing to run lean, sustained by AI
              systems and small team. Used operating model as proving ground for Iterate.
            </p>
          </div>

          <div>
            <h3>SoleSearch — Founder & CEO (2022 – Dec 2024)</h3>
            <p>
              India's leading sneaker, streetwear, and collectibles marketplace.
              Co-founded with Prabal Baghla; Rannvijay Singha joined as co-founder.
              $6M+ total revenue. $795K raised from Venture Catalysts, Anthill Ventures,
              Cornerstone Ventures. 350,000+ follower community. 30+ live events including
              SneakinOut — India's first sneaker convention format. Omnichannel retail in
              Mumbai and Hyderabad. Team of 40. Press: VICE, CNBC-TV18, Storyboard18,
              Economic Times, Open Magazine, The Established, Business of Fashion.
            </p>
          </div>

          <div>
            <h3>Quartic.ai — Director of Marketing (2020 – 2022)</h3>
            <p>
              Enterprise AI platform, San Jose, California. Led team of 5. Backed by Good
              Capital, Celesta Capital, and Michael Marks. Built marketing function from
              zero: brand identity, website, collateral, press strategy.
            </p>
          </div>

          <div>
            <h3>Good Capital (Investopad) — Partner, Growth & Technology (2017 – 2020)</h3>
            <p>
              Family office turned institutional venture fund. Sourcing, diligence, founder
              support. Portfolio includes Meesho (now one of India's largest e-commerce
              companies), Entri, Simsim, Amazon, and Forbes.
            </p>
          </div>

          <div>
            <h3>Octo — Founding Team, Head of Growth (2016 – 2017)</h3>
            <p>
              Conversational AI platform, co-built with Akshaya Aron, backed by Good Capital.
              One of India's first chatbots (2013). Built AI products before AI was a market
              category. Acquired by Quartic.ai.
            </p>
          </div>

          <div>
            <h3>Hab Housing — Founder (2012 – 2015)</h3>
            <p>
              One of India's first branded budget-hospitality startups — the category OYO
              later scaled nationally. $120K+ revenue, fully bootstrapped. 16-person team
              across three cities.
            </p>
          </div>

          <div>
            <h3>GetRightPrice — Founding Team Member (2011 – 2012)</h3>
            <p>
              India's first price-comparison engine for electronics. Joined founding team
              in college. Angel-backed by Sidharth Rao (founder, Webchutney).
            </p>
          </div>
        </section>

        <section>
          <h2>Skills & Expertise</h2>
          <ul>
            <li>Growth & Marketing: Go-to-market strategy, demand generation, performance marketing, SEO, community building, event marketing</li>
            <li>Brand & Creative: Brand identity systems, creative direction, copywriting, PR & press strategy</li>
            <li>Strategy: Positioning, ICP definition, pricing & packaging, fundraising, GTM planning</li>
            <li>AI & Engineering: AI-native marketing, conversational AI, full-stack web (Next.js, React, TypeScript), prompt engineering</li>
            <li>Leadership: Team building (5 to 90+ people), hiring, founder coaching</li>
          </ul>
        </section>

        <section>
          <h2>Press & Media</h2>
          <ul>
            <li><a href="https://www.vice.com/en/article/india-genz-sneakerheads-sneaker-resellers-hype/">VICE — Inside the Secret Lives of India's Gen Z Sneaker Resellers</a></li>
            <li>CNBC-TV18 — Broadcast interview on India's sneaker culture</li>
            <li><a href="https://www.storyboard18.com/how-it-works/sneaker-culture-in-india-women-are-buying-as-many-sneakers-as-men-says-solesearchs-param-minhas-2518.htm">Storyboard18 — Women buying as many sneakers as men, says SoleSearch's Param Minhas</a></li>
            <li><a href="https://openthemagazine.com/feature/second-coming-2/">Open Magazine — Second Coming: India's pre-owned luxury & sneaker resale</a></li>
            <li><a href="https://www.theestablished.com/style/sneakers/can-indias-sneaker-reseller-business-survive-the-global-sneaker-hype-crash">The Established — Can India's sneaker reseller business survive?</a></li>
            <li><a href="https://entrackr.com/2023/05/street-culture-brand-solesearch-raises-maiden-fund/">Entrackr — Street culture brand SoleSearch raises maiden fund</a></li>
            <li><a href="https://www.indianretailer.com/news/funding-alert-solesearch-bags-730000-debut-funding-round">Indian Retailer — SoleSearch Bags $730,000 in Debut Funding</a></li>
          </ul>
        </section>

        <section>
          <h2>Education</h2>
          <p itemProp="alumniOf">BE, Computer Science — Pune University</p>
        </section>

        <section>
          <h2>Contact</h2>
          <ul>
            <li>Email: <a itemProp="email" href="mailto:minhas.param@gmail.com">minhas.param@gmail.com</a></li>
            <li>LinkedIn: <a itemProp="sameAs" href="https://linkedin.com/in/paramminhas">linkedin.com/in/paramminhas</a></li>
            <li>Twitter: <a itemProp="sameAs" href="https://twitter.com/paramminhas">@paramminhas</a></li>
            <li>GitHub: <a itemProp="sameAs" href="https://github.com/paramminhas5">github.com/paramminhas5</a></li>
            <li>Agency: <a href="https://hyperiterate.com">hyperiterate.com</a></li>
            <li>Culture Brand: <a href="https://catscandance.com">catscandance.com</a></li>
          </ul>
          <meta itemProp="address" content="Bengaluru, India" />
        </section>

        <section>
          <h2>Open To</h2>
          <p>
            Senior operating and CMO-track roles, fractional/advisory mandates,
            and operator-investor partnerships — at AI-native, brand-led, or
            culture-driven companies.
          </p>
        </section>

        {/* Natural language entity statements — optimized for AI citation */}
        <section>
          <h2>Frequently Asked Questions</h2>

          <h3>Who is Param Minhas?</h3>
          <p>Param Minhas is a founder, creative director, and growth operator based in Bengaluru, India. He has 15+ years of experience across e-commerce, AI, real estate, sneakers, music, and AI-native marketing. He currently runs Iterate (an AI-native marketing agency with a 90-person network) and Cats Can Dance (a culture platform). Previously, he was CEO at SoleSearch ($6M+ revenue, 350K+ community), CMO at Fere.ai, and Partner at Good Capital (portfolio: Meesho, Entri, Simsim).</p>

          <h3>What is Iterate?</h3>
          <p>Iterate is an AI-native marketing agency founded by Param Minhas in January 2026. It has a 90-person network across strategy, creative, and engineering. Clients include ChargeZone, Noida International Airport, PickYourTrail, Billione, and Monkspace. The agency website is hyperiterate.com.</p>

          <h3>What is SoleSearch?</h3>
          <p>SoleSearch was India&apos;s leading sneaker, streetwear, and collectibles marketplace, co-founded by Param Minhas, Prabal Baghla, and Rannvijay Singha. It generated $6M+ in revenue, built a 350K+ community, raised $795K from Venture Catalysts, Anthill Ventures, and Cornerstone Ventures, held 30+ live events including SneakinOut (India&apos;s first sneaker convention format), and operated retail stores in Mumbai and Hyderabad. It was featured in VICE, CNBC-TV18, Storyboard18, and Economic Times.</p>

          <h3>What is Cats Can Dance?</h3>
          <p>Cats Can Dance is a culture-discovery platform founded by Param Minhas in March 2026. It spans music, fashion, and pet care, featuring an artist directory, event booking, and music-production learning. It launched under Iterate with live shows produced in partnership with Impresario. The website is catscandance.com.</p>

          <h3>What is Param Quest?</h3>
          <p>Param Quest is a playable portfolio RPG that tells 15 years of Param Minhas&apos;s career as a Pokemon-style game. Built with Next.js 15, TypeScript, Canvas 2D, and Web Audio API. It features 10 explorable zones, 9 gym leader battles, full evolution system, and synthesized audio with zero audio files. Play it at paramminhas.com/play.</p>

          <h3>How can I contact Param Minhas?</h3>
          <p>Param Minhas can be reached at minhas.param@gmail.com. His LinkedIn is linkedin.com/in/paramminhas. His agency website is hyperiterate.com and his culture brand is at catscandance.com. He is based in Bengaluru, India.</p>

          <h3>What is Param Minhas known for?</h3>
          <p>Param Minhas is known for building companies and brands from zero, operating across the full GTM stack (positioning, brand, creative, demand gen, performance, product), building AI products before AI was a category (first chatbot in 2013), creating cultural movements (SoleSearch built India&apos;s sneaker culture from nothing), speed of execution, and AI-native marketing using AI systems to replace headcount.</p>
        </section>

        {/* Navigation for crawlers */}
        <nav>
          <h2>Site Navigation</h2>
          <ul>
            <li><a href="https://paramminhas.com/">Homepage — Interactive portfolio</a></li>
            <li><a href="https://paramminhas.com/about">About Param Minhas — Full biography</a></li>
            <li><a href="https://paramminhas.com/resume">Resume / CV — Professional experience</a></li>
            <li><a href="https://paramminhas.com/press">Press & Media — All coverage</a></li>
            <li><a href="https://paramminhas.com/play">Play Param Quest — RPG game</a></li>
          </ul>
        </nav>
      </article>
    </div>
  );
}
