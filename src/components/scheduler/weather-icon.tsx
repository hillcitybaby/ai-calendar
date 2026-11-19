import { Cloud, CloudRain, CloudSun, Moon, Sun, type LucideIcon } from "lucide-react";

import type { WeatherKind } from "@/lib/types";

export const WEATHER_ICONS: Record<WeatherKind, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  rain: CloudRain,
  moon: Moon,
};

export const WEATHER_LABELS: Record<WeatherKind, string> = {
  sun: "Sunny",
  "cloud-sun": "Partly cloudy",
  cloud: "Cloudy",
  rain: "Rain",
  moon: "Clear evening",
};

export function WeatherIcon({ kind, className }: { kind: WeatherKind; className?: string }) {
  const Icon = WEATHER_ICONS[kind];
  return <Icon className={className} aria-label={WEATHER_LABELS[kind]} role="img" />;
}
