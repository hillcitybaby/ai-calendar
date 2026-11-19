import {
  CalendarCheck,
  CalendarDays,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra path prefixes that also mark this item active. */
  match?: string[];
  showCount?: boolean;
};

/** Sidebar "Plan" group. Month is reached from the Day/Week/Month toggle. */
export const PLAN_NAV: NavItem[] = [
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/week", label: "Week", icon: CalendarDays, match: ["/month"] },
  { href: "/suggestions", label: "Suggestions", icon: Lightbulb, showCount: true },
];

export function isActive(item: NavItem, pathname: string) {
  return [item.href, ...(item.match ?? [])].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
