import { format, isSameDay } from "date-fns";

import { weatherFor } from "@/lib/schedule";
import { cn } from "@/lib/utils";

import { WeatherIcon } from "./weather-icon";

/** Day Header (AC): weekday, date (filled circle on today) and optional weather. */
export function DayHeader({
  date,
  today,
  showWeather = true,
  className,
}: {
  date: Date;
  today: Date;
  showWeather?: boolean;
  className?: string;
}) {
  const isToday = isSameDay(date, today);
  const weather = weatherFor(date);
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2", className)}>
      <p className={cn("text-xs font-medium", isToday ? "text-foreground" : "text-muted-foreground")}>
        {format(date, "EEE")}
      </p>
      <p
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-base font-medium",
          isToday ? "bg-primary text-primary-foreground" : "text-foreground",
        )}
        aria-label={`${format(date, "EEEE, MMMM d")}${isToday ? ", today" : ""}`}
      >
        {format(date, "d")}
      </p>
      {showWeather && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <WeatherIcon kind={weather.kind} className="size-3" />
          {weather.temp}°
        </p>
      )}
    </div>
  );
}
