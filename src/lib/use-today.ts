"use client";

import * as React from "react";
import { startOfDay } from "date-fns";

/**
 * Today's date at local midnight. The server may render in another time zone,
 * so text derived from it should use suppressHydrationWarning.
 */
export function useToday() {
  const [today] = React.useState(() => startOfDay(new Date()));
  return today;
}
