import { type HomeworkEntry, SUBJECTS, type Subject } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";

export function HomeworkList({
  entries,
  emptyText = "No homework here.",
  showWeekendRange = false,
  onRemove,
}: {
  entries: HomeworkEntry[];
  emptyText?: string;
  showWeekendRange?: boolean;
  onRemove?: (id: string) => void;
}) {
  // group by subject (preserve SUBJECTS order)
  const bySubject = new Map<Subject, HomeworkEntry[]>();
  SUBJECTS.forEach((s) => bySubject.set(s.key, []));
  entries.forEach((e) => bySubject.get(e.subject)?.push(e));

  const hasAny = entries.length > 0;

  if (!hasAny) {
    return <p className="text-on-surface-muted px-1 py-6 text-center text-sm">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {SUBJECTS.map((s) => {
        const list = bySubject.get(s.key) ?? [];
        if (list.length === 0) return null;
        return (
          <div key={s.key} className="rounded-2xl bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                style={{ background: s.color, color: "oklch(0.16 0.005 270)" }}
              >
                {s.icon}
              </span>
              <p className="text-on-surface text-sm font-semibold">{s.label}</p>
            </div>
            <div className="space-y-2">
              {list.map((e) => (
                <Entry
                  key={e.id}
                  entry={e}
                  showWeekendRange={showWeekendRange}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Entry({
  entry,
  showWeekendRange,
  onRemove,
}: {
  entry: HomeworkEntry;
  showWeekendRange?: boolean;
  onRemove?: (id: string) => void;
}) {
  const fields: { label: string; value?: string }[] = [
    { label: "DPP", value: entry.dpp },
    { label: "Modules", value: entry.modules },
    { label: "Others", value: entry.others },
  ].filter((f) => f.value && f.value.trim().length > 0);

  return (
    <div className="rounded-xl bg-[oklch(0.18_0.005_270)] p-3">
      {entry.kind === "weekend" && (
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.85_0.11_60)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.16_0.005_270)]">
            Weekend
          </span>
          {showWeekendRange && entry.weekendEndDate && (
            <span className="text-on-surface-muted text-[10px]">
              {format(parseISO(entry.date), "EEE")} → {format(parseISO(entry.weekendEndDate), "EEE")}
            </span>
          )}
        </div>
      )}
      <div className="space-y-1.5">
        {fields.map((f) => (
          <div key={f.label} className="flex gap-2">
            <span className="text-on-surface-muted shrink-0 text-[11px] font-semibold uppercase tracking-wider">
              {f.label}
            </span>
            <span className="text-on-surface whitespace-pre-wrap text-sm">{f.value}</span>
          </div>
        ))}
      </div>
      {onRemove && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => onRemove(entry.id)}
            className="text-on-surface-muted flex items-center gap-1 text-[11px] active:opacity-60"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      )}
    </div>
  );
}
