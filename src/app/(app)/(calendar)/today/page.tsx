import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shell/page-placeholder";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  return <PagePlaceholder>The Today view is built in Milestone 2.</PagePlaceholder>;
}
