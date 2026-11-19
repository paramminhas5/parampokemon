// Drafts for Param's review. They render at /writing/<slug> with a "draft for review" banner,
// are noindex, and are left out of /writing, the sitemap and structured data.
// To publish one: move it into POSTS in lib/posts.ts (or delete `draft: true` handling for it).
// Series parts under review go here. The first-pass drafts were removed on 18 Nov 2026 at Param's request.
// 19 Nov 2026: two drafts from the Cats Can Dance search work and the repo archive. CCD numbers are from
// CCD's own Search Console and repos; Google and Ahrefs facts are linked in `sources`.
import type { Post } from "./posts";

export const DRAFTS: Post[] = [
  {
    slug: "what-google-changed-in-2026-and-what-we-did-at-cats-can-dance",
    title: "What Google changed in 2026, and what we did about it at Cats Can Dance",
    description:
      "FAQ rich results are gone, llms.txt does nothing for Google, and mentions matter more than links. How Param Minhas is rebuilding search for Cats Can Dance around that.",
    date: "2026-11-19",
    tag: "AI and marketing",
    body: [
      "This week I sat down to work out why Cats Can Dance, our music and nights platform in Bangalore, gets found for artist names but not for parties. Before touching anything I went through what Google itself changed this year, because a lot of the advice still going around is out of date.",
      "Three changes matter most. On 7 May 2026 Google stopped showing FAQ rich results in Search. FAQ markup can stay on a page, but it no longer gets you the expandable answers under your listing, so it is not a traffic lever anymore.",
      "On 15 May Google published its own guide to showing up in AI Overviews and AI Mode, and on 15 June it added a note on llms.txt. The message is plain: AI features pull from the same index as normal search, and you do not need llms.txt, AI-only rewrites, content chunking or special schema to appear in them. Good SEO is the AI strategy.",
      "On 3 June Search Console got a Generative AI report that shows how often your pages appear in AI Overviews and AI Mode. It shows impressions only, not clicks or queries, but for the first time you can see which pages AI search is using.",
      "The fourth thing is not from Google. Ahrefs looked at 75,000 brands and found branded web mentions correlate with AI Overview visibility at 0.664, against 0.218 for backlinks. It is a correlation, measured mostly on bigger brands, but the direction is clear. Being talked about now counts for more than being linked to.",
      "Then I looked at our own numbers. Over three days Search Console showed 15 clicks and 396 impressions from 62 queries, and every one of them was a brand or artist name. Google had indexed 338 of our pages and left 709 out, 422 of them as crawled but not indexed. A lot of those were copies of artist pages, like press kits and link pages, competing with the artist page itself.",
      "So the plan is less about new pages and more about fewer, better ones. Copies of artist pages now tell Google not to index them, so each artist has one page that collects the signal. Our titles say parties and Bangalore, because that is what people type, not gigs and Bengaluru. Each city gets one party page that answers tonight and this weekend, and it only asks to be indexed when there are at least three real nights on it. We are not making a thin page for every day, sound or area, because Google's May guide names that pattern as scaled content.",
      "Two things protect the work. Every pull request now runs an SEO guard that compares the preview with the live site, page by page, the way a crawler reads it. If a title, heading, canonical, structured data type or indexable page goes missing, the check fails before anything ships. And an agent reads Search Console, the Generative AI report and our Google Alerts every day, so we see mentions and drops while they are still small.",
      "The part I care about most is that none of this is built for Google alone. A party page that lists every good night in the city this weekend is useful to the person searching, to an AI answering the same question and to the crawler. If a page would only exist for search, we do not build it.",
    ],
    sources: [
      { label: "Search Engine Land: Google ends FAQ rich results", url: "https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957" },
      { label: "Search Engine Journal: Google's llms.txt guidance", url: "https://www.searchenginejournal.com/googles-llms-txt-guidance-depends-on-which-product-you-ask" },
      { label: "Search Engine Roundtable: llms.txt won't help or hurt", url: "https://seroundtable.com/google-llms-txt-files-hurt-help-41512.html" },
      { label: "Google Search Central: Generative AI performance reports", url: "https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports" },
      { label: "Ahrefs: AI Overview brand visibility factors, 75K brands", url: "https://ahrefs.com/blog/ai-overview-brand-correlation/" },
    ],
  },
  {
    slug: "31-repos-into-one-what-seven-months-of-restarts-taught-me",
    title: "31 repos into one: what seven months of restarts taught me",
    description:
      "Param Minhas folded 31 GitHub repos into one archive with their history intact. What the restarts across Cats Can Dance, CCD School, Iterate and his portfolio taught him.",
    date: "2026-11-19",
    tag: "Credibility",
    body: [
      "This week I folded 31 of my GitHub repos into one private archive. Each one keeps its full history in its own folder, and every branch is still there. Then I wrote down what each project taught me, because the lessons were worth more than most of the code.",
      "Most of those 31 repos were not separate projects. They were copies and restarts of five: Cats Can Dance, CCD School, the Iterate site, my portfolio and an Agilitas pitch. That alone is the first lesson.",
      "Cats Can Dance went through four frameworks in about six months. It started as a Lovable app with 477 commits, moved to a Next.js monorepo on Replit, tried a new Next 16 stack that stopped after 18 commits, and ended on Next 14 with Supabase on Vercel. The plain stack won. Every move before that cost weeks of rewriting things that already worked.",
      "The second lesson is about search. The single page app versions of the site could not rank, and AI crawlers could not read them, because they do not run JavaScript. The search work we are doing now only became possible once the pages were rendered on the server.",
      "Third, builders like Lovable, Replit and Kiro are great for a fast first look and poor for the product. Every project I started in one needed a rewrite before it could be maintained. I still use them to see an idea quickly. I no longer expect to ship from them.",
      "Fourth, copies split decisions. The Iterate site lived in five repos at once while I explored directions. Cats Can Dance had a clone, a latest and a final. Each copy kept part of the history and none had all of it. Branches with a preview each do the same job in one place, and that is how everything works now.",
      "The last lesson is the one I keep coming back to. What lasted across all of it was ideas and content, not code. The Cats Can Dance site map, the School's habit of explaining a concept, letting you try it and then asking one question at a time, the playable CV and the pitch built as a 3D website all survived every rewrite. That is what the archive is for.",
    ],
  },
];
