import type { Metadata } from "next";
import { Suspense } from "react";

import { WeekView } from "@/components/screens/week-view";

export const metadata: Metadata = { title: "Week" };

export default function WeekPage() {
  return (
    <Suspense>
      <WeekView />
    </Suspense>
  );
}
