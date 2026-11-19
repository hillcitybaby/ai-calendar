/** Settings sections, shared by the Settings view and the /settings/[section] route. */
export const SECTIONS = [
  { id: "general", label: "General" },
  { id: "planning", label: "Planning" },
  { id: "suggestions", label: "Suggestions" },
  { id: "notifications", label: "Notifications" },
  { id: "connectors", label: "Connectors & interests", href: "/settings/connectors" },
  { id: "account", label: "Account" },
] as const;

export type SettingsSectionId = (typeof SECTIONS)[number]["id"];

/** Sections with their own detail screen on mobile (Connectors has its own page). */
export const DETAIL_SECTIONS: SettingsSectionId[] = ["general", "planning", "suggestions", "notifications", "account"];
