import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shell/page-placeholder";

export const metadata: Metadata = { title: "Week" };

export default function WeekPage() {
  return <PagePlaceholder>The Week view is built in Milestone 3.</PagePlaceholder>;
}
