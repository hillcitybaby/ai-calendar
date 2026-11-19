import { addDays, format, nextDay, type Day } from "date-fns";

export type ParsedTask = {
  title: string;
  durationMin?: number;
  durationLabel?: string;
  channel?: string;
  day?: Date;
  dayLabel?: string;
};

const WEEKDAYS: Record<string, Day> = {
  sun: 0, sunday: 0, mon: 1, monday: 1, tue: 2, tues: 2, tuesday: 2, wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4, fri: 5, friday: 5, sat: 6, saturday: 6,
};

/**
 * Quick-add parsing for Add Task (AC): "Review case study 45m #work tomorrow"
 * → title, length, channel and day. Unrecognized words stay in the title.
 */
export function parseTask(input: string, today: Date): ParsedTask {
  const out: ParsedTask = { title: "" };
  const keep: string[] = [];
  for (const word of input.trim().split(/\s+/).filter(Boolean)) {
    const lower = word.toLowerCase();
    const dur = lower.match(/^(?:(\d+(?:\.\d+)?)h)?(?:(\d+)m(?:in)?)?$/);
    if (dur && (dur[1] || dur[2]) && out.durationMin === undefined) {
      out.durationMin = Math.round(Number(dur[1] ?? 0) * 60 + Number(dur[2] ?? 0));
      out.durationLabel = word;
      continue;
    }
    if (/^#[\w-]+$/.test(word) && !out.channel) {
      out.channel = word.slice(1).toLowerCase();
      continue;
    }
    if (!out.day) {
      if (lower === "today") {
        out.day = today;
        out.dayLabel = "Today";
        continue;
      }
      if (lower === "tomorrow") {
        out.day = addDays(today, 1);
        out.dayLabel = "Tomorrow";
        continue;
      }
      if (lower in WEEKDAYS) {
        out.day = nextDay(today, WEEKDAYS[lower]);
        out.dayLabel = format(out.day, "EEEE");
        continue;
      }
    }
    keep.push(word);
  }
  out.title = keep.join(" ");
  return out;
}
