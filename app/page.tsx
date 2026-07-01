import { SeoContent } from "@/components/home/SeoContent";
import { HomeClient } from "@/components/home/HomeClient";

export default function Home() {
  return (
    <>
      {/* Server-rendered SEO content — visible to crawlers, hidden from users */}
      <SeoContent />
      {/* Client-side interactive homepage */}
      <HomeClient />
    </>
  );
}
