// Writing bank for paramminhas.com/writing.
// Add a post by appending to POSTS. Newest first. Body paragraphs are plain strings.
// Rules: facts only from the Facts Bank or sources linked in `sources`. No em dashes.

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tag: "Credibility" | "AI and marketing" | "Community";
  body: string[];
  sources?: { label: string; url: string }[];
};

export const POSTS: Post[] = [
  {
    slug: "whatsapp-bots-2013-to-chargemate",
    title: "WhatsApp bots: from AHit in 2013 to Chargemate, and Meta's new rule",
    description:
      "Param Minhas built his first chatbot on WhatsApp in 2013. What Meta's 2026 WhatsApp Business API terms change, and what they leave alone.",
    date: "2026-11-05",
    tag: "AI and marketing",
    body: [
      "My first chatbot ran on WhatsApp in 2013. It was called AHit. My latest one runs on WhatsApp too.",
      "Meta added an AI providers section to the WhatsApp Business API terms. It took effect on 15 January 2026. AI companies can no longer use the API to offer general-purpose assistants, meaning bots where the AI is the main product. OpenAI, Perplexity and Microsoft said their WhatsApp bots would stop working. Meta AI is now the only assistant left on the app.",
      "The same terms still allow a business to use AI to serve its own customers. Meta's own example is a travel company running a customer service bot.",
      "That second case is the one I work on. At Iterate we shipped Chargemate, a WhatsApp conversational commerce and support agent. We built the revenue model, set the pricing and ran a six week rollout.",
      "One detail worth knowing: Meta decides what counts as a general-purpose bot, at its sole discretion. Regulators in the EU, Italy and Brazil have opened antitrust probes into the rules.",
      "Anyone building on WhatsApp is building on a channel someone else owns.",
    ],
    sources: [
      {
        label: "TechCrunch: WhatsApp changes its terms to bar general-purpose chatbots from its platform",
        url: "https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform",
      },
    ],
  },
  {
    slug: "ranked-is-not-cited-240-brands-ai-answers",
    title: "Ranked is not cited: what 240 brands show about AI answers",
    description:
      "A 2026 study of 240 brands across ChatGPT, Gemini, Claude and Perplexity, and what it means for getting cited inside AI answers.",
    date: "2026-11-05",
    tag: "AI and marketing",
    body: [
      "The average brand shows up in about a third of the AI answers where it should.",
      "Sourceable tracked 240 brands across 1,800 category prompts on ChatGPT, Gemini, Claude and Perplexity, from March to May 2026. The average brand appeared in 34% of relevant answers. By engine, ChatGPT mentioned brands 41% of the time, Gemini 36%, Perplexity 33% and Claude 29%.",
      "The engines also disagree with each other. A brand named first on Perplexity appeared in only 42% of equivalent ChatGPT answers.",
      "71% of mentions came in answers that sent no traffic. 9% of mentions carried outdated or wrong information. Brands that were cited often held their position 2.3 times more steadily over time.",
      "Two cautions. Sourceable sells a tracking tool, so it has a stake in the result. And the study shows correlation, not proven drivers.",
      "What I take from it is that ranked and cited are different problems. At Iterate we built AVA (AI Visibility Architecture) around the second one: structured data, entity optimisation and llms.txt, so brands get cited inside the answer, not just ranked.",
    ],
    sources: [
      {
        label: "Sourceable: We analyzed 240 brands across ChatGPT, Gemini, Claude and Perplexity (DEV Community)",
        url: "https://dev.to/sourceable/we-analyzed-240-brands-across-chatgpt-gemini-claude-perplexity-heres-what-ai-visibility-2n70",
      },
    ],
  },
  {
    slug: "solesearch-350000-members-almost-no-paid-traffic",
    title: "SoleSearch: 350,000 members and almost no paid traffic",
    description:
      "How Param Minhas grew SoleSearch to $6M+ GMV with community, drops and earned media instead of paid acquisition.",
    date: "2026-11-05",
    tag: "Community",
    body: [
      "At SoleSearch, almost none of our traffic was bought.",
      "We averaged 250K monthly sessions and peaked at 310K. We had 60,000 registered users and an average order value of ₹15,000. Between 2022 and 2024 the marketplace did $6M+ in GMV and $1.2M+ in revenue at a 20% take rate. The peak month passed ₹2Cr.",
      "The traffic came from community, drops and earned media. We built a 350,000 member community because it was the cheapest way to acquire a customer. Then we converted it into repeat purchase through member-first access.",
      "I was co-founder and CEO. Growth, brand and the P&L were mine. At peak we were 40 people across marketing, design, engineering and ops, and we raised $795K from Venture Catalysts, Anthill and Cornerstone.",
      "Press included VICE, CNBC-TV18, Economic Times, Inc42 and Business of Fashion.",
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
