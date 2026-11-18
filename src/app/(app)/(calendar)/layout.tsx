import { Suspense } from "react";

import { CalendarTopBar } from "@/components/shell/calendar-top-bar";

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-[60px] shrink-0 border-b border-border" />}>
        <CalendarTopBar />
      </Suspense>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </>
  );
}
