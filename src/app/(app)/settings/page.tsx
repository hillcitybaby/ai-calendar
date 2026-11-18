import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shell/page-placeholder";
import { TopBar } from "@/components/shell/top-bar";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <div className="min-h-0 flex-1 overflow-auto">
        <PagePlaceholder>The Settings page is built in Milestone 5.</PagePlaceholder>
      </div>
    </>
  );
}
