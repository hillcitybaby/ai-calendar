import type { Metadata } from "next";

import { SuggestionsView } from "@/components/screens/suggestions-view";

export const metadata: Metadata = { title: "Suggestions" };

export default function SuggestionsPage() {
  return <SuggestionsView />;
}
