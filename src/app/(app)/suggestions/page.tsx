import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shell/page-placeholder";
import { TopBar } from "@/components/shell/top-bar";

export const metadata: Metadata = { title: "Suggestions" };

export default function SuggestionsPage() {
  return (
    <>
      <TopBar title="Suggestions" />
      <div className="min-h-0 flex-1 overflow-auto">
        <PagePlaceholder>The Suggestions page is built in Milestone 4.</PagePlaceholder>
      </div>
    </>
  );
}
