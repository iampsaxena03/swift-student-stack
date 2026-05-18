import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

type CommonProps = {
  markedDates?: string[];
  markColor?: string;
  selectedDate?: string;
};

type ToggleProps = CommonProps & {
  absences: string[];
  onToggle: (date: string) => void;
  onSelect?: never;
};

type SelectProps = CommonProps & {
  absences?: never;
  onToggle?: never;
  onSelect: (date: string) => void;
};

export function Calendar(props: ToggleProps | SelectProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const offset = getDay(start);
    const total = end.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= total; d++)
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const today = new Date();
  const absSet = new Set(props.absences ?? []);
  const markSet = new Set(props.markedDates ?? []);
  const markColor = props.markColor ?? "oklch(0.85 0.11 60)";

  return (
    <div className="rounded-3xl bg-white p-5 text-ink shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">{format(cursor, "yyyy")}</p>
          <p className="text-xl font-semibold">{format(cursor, "MMMM")}</p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous month"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.95_0.005_270)] active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.95_0.005_270)] active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] text-ink-muted">
        {WEEK.map((d, i) => (
          <div key={i} className="py-1 font-medium">{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const key = format(d, "yyyy-MM-dd");
          const absent = absSet.has(key);
          const marked = markSet.has(key);
          const isToday = isSameDay(d, today);
          const isSelected = props.selectedDate === key;

          const handle = () => {
            if (props.onToggle) props.onToggle(key);
            else if (props.onSelect) props.onSelect(key);
          };

          return (
            <button
              key={i}
              onClick={handle}
              className={`relative flex aspect-square items-center justify-center rounded-2xl text-sm font-medium transition active:scale-90 ${
                absent
                  ? "bg-ink text-on-surface"
                  : isSelected
                    ? "bg-[oklch(0.16_0.005_270)] text-white"
                    : isToday
                      ? "bg-[oklch(0.92_0.05_240)] text-ink"
                      : "text-ink hover:bg-[oklch(0.96_0.005_270)]"
              }`}
            >
              {d.getDate()}
              {(absent || marked) && (
                <span
                  className="absolute bottom-1.5 h-1 w-1 rounded-full"
                  style={{ background: absent ? "oklch(0.86 0.09 10)" : markColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
