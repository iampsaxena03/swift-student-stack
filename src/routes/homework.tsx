import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { PhoneShell } from "@/components/PhoneShell";
import { Calendar } from "@/components/Calendar";
import { HomeworkList } from "@/components/HomeworkList";
import { useStore, getHomeworkForDate } from "@/lib/store";

export const Route = createFileRoute("/homework")({
  head: () => ({
    meta: [
      { title: "Homework · Slyve" },
      { name: "description", content: "Browse homework day-by-day." },
    ],
  }),
  component: HomeworkPage,
});

function todayStr() {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function HomeworkPage() {
  const homework = useStore((s) => s.homework);
  const removeHomework = useStore((s) => s.removeHomework);
  const [selected, setSelected] = useState<string>(todayStr());

  const marked = useMemo(() => {
    const set = new Set<string>();
    for (const h of homework) {
      if (h.kind === "today") set.add(h.date);
      else if (h.kind === "weekend" && h.weekendEndDate) {
        // mark every day in range
        const start = parseISO(h.date);
        const end = parseISO(h.weekendEndDate);
        for (
          let d = new Date(start);
          d <= end;
          d.setDate(d.getDate() + 1)
        ) {
          set.add(format(d, "yyyy-MM-dd"));
        }
      }
    }
    return Array.from(set);
  }, [homework]);

  const { today, weekend } = useMemo(
    () => getHomeworkForDate(homework, selected),
    [homework, selected],
  );

  return (
    <PhoneShell>
      <div className="px-5 pt-12">
        <p className="text-on-surface-muted text-sm">Tracker</p>
        <h1 className="text-on-surface mt-1 text-3xl font-semibold tracking-tight">Homework</h1>

        <div className="mt-5">
          <Calendar
            markedDates={marked}
            selectedDate={selected}
            onSelect={(d) => setSelected(d)}
          />
        </div>

        <div className="mt-5">
          <p className="text-on-surface text-sm font-semibold">
            {format(parseISO(selected), "EEEE, MMM d")}
          </p>
          <p className="text-on-surface-muted text-xs">
            {today.length + weekend.length} entries
          </p>

          {today.length > 0 && (
            <div className="mt-3">
              <p className="text-on-surface-muted mb-2 text-[11px] font-semibold uppercase tracking-wider">
                Today's
              </p>
              <HomeworkList entries={today} onRemove={removeHomework} />
            </div>
          )}

          {weekend.length > 0 && (
            <div className="mt-4">
              <p className="text-on-surface-muted mb-2 text-[11px] font-semibold uppercase tracking-wider">
                Weekend
              </p>
              <HomeworkList entries={weekend} showWeekendRange onRemove={removeHomework} />
            </div>
          )}

          {today.length === 0 && weekend.length === 0 && (
            <p className="text-on-surface-muted mt-4 text-center text-sm">
              No homework recorded for this day.
            </p>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
