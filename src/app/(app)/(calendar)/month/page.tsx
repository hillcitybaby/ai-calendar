import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shell/page-placeholder";

export const metadata: Metadata = { title: "Month" };

export default function MonthPage() {
  return <PagePlaceholder>The Month view is built in Milestone 3.</PagePlaceholder>;
}
