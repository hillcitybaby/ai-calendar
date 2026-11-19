import type { Metadata } from "next";
import { Suspense } from "react";

import { TodayView } from "@/components/screens/today-view";

export const metadata: Metadata = { title: "Day" };

/** The Calendar tab's Day view on mobile; the same as Today from 768px up. */
export default function DayPage() {
  return (
    <Suspense>
      <TodayView mobile="calendar" />
    </Suspense>
  );
}
