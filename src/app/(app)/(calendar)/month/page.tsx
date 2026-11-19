import type { Metadata } from "next";
import { Suspense } from "react";

import { MonthView } from "@/components/screens/month-view";

export const metadata: Metadata = { title: "Month" };

export default function MonthPage() {
  return (
    <Suspense>
      <MonthView />
    </Suspense>
  );
}
