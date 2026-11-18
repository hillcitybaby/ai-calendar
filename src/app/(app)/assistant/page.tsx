import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shell/page-placeholder";
import { TopBar } from "@/components/shell/top-bar";

export const metadata: Metadata = { title: "Assistant" };

export default function AssistantPage() {
  return (
    <>
      <TopBar title="Assistant" />
      <div className="min-h-0 flex-1 overflow-auto">
        <PagePlaceholder>The Assistant page is built in a later milestone.</PagePlaceholder>
      </div>
    </>
  );
}
