import type { Metadata } from "next";
import { ExpertPageView, expertMetadata } from "@/components/ExpertPageView";
import { getExpertPage } from "@/lib/expertise";

const page = getExpertPage("design");

export const metadata: Metadata = expertMetadata(page);

export default function Page() {
  return <ExpertPageView page={page} />;
}
