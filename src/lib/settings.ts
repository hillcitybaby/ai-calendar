export type Settings = {
  name: string;
  timeZone: string;
  weekStartsOn: 0 | 1;
  theme: "light" | "dark" | "system";
  workingHours: { start: number; end: number; days: string };
  morningPlan: boolean;
  defaultTaskMin: number;
  protectFamilyTime: boolean;
  suggestionAmount: "few" | "some" | "lots";
  budget: "free" | "some" | "any";
  kidFriendlyFirst: boolean;
  useWeather: boolean;
  homeArea: string;
  notifyMorningPlan: boolean;
  notifySuggestionDigest: boolean;
  reminderMin: number;
};

export const DEFAULT_SETTINGS: Settings = {
  name: "Alex",
  timeZone: "Central Time",
  weekStartsOn: 0,
  theme: "system",
  workingHours: { start: 9, end: 17, days: "Mon–Fri" },
  morningPlan: true,
  defaultTaskMin: 30,
  protectFamilyTime: true,
  suggestionAmount: "some",
  budget: "free",
  kidFriendlyFirst: true,
  useWeather: true,
  homeArea: "Your town · within 30 miles",
  notifyMorningPlan: true,
  notifySuggestionDigest: true,
  reminderMin: 10,
};
