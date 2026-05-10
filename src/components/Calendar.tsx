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

export function Calendar({
  absences,
  onToggle,
}: {
  absences: string[];
  onToggle: (date: string) => void;
}) {
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
  const absSet = new Set(absences);

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
          <div key={i} className="py-1 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const key = format(d, "yyyy-MM-dd");
          const absent = absSet.has(key);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={i}
              onClick={() => onToggle(key)}
              className={`relative flex aspect-square items-center justify-center rounded-2xl text-sm font-medium transition active:scale-90 ${
                absent
                  ? "bg-ink text-on-surface"
                  : isToday
                    ? "bg-[oklch(0.92_0.05_240)] text-ink"
                    : "text-ink hover:bg-[oklch(0.96_0.005_270)]"
              }`}
            >
              {d.getDate()}
              {absent && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[oklch(0.86_0.09_10)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}