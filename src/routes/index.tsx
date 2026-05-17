import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ListChecks, Plus, Pin, ChevronRight, Check } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { useStore, colorTile } from "@/lib/store";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Slyve" },
      { name: "description", content: "Track absences. Never forget a thing." },
    ],
  }),
  component: Index,
});

function Index() {
  const hydrated = useStore((s) => s.hydrated);
  const absences = useStore((s) => s.absences);
  const checklists = useStore((s) => s.checklists);
  const toggleAbsence = useStore((s) => s.toggleAbsence);

  const today = format(new Date(), "yyyy-MM-dd");
  const isAbsentToday = absences.includes(today);
  const monthAbs = absences.filter((d) => d.startsWith(today.slice(0, 7))).length;
  const pinned = checklists.filter((c) => c.pinned);

  return (
    <PhoneShell>
      <div className="px-5 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-muted">{format(new Date(), "EEEE, MMM d")}</p>
            <h1 className="text-on-surface text-3xl font-semibold tracking-tight">Slyve</h1>
          </div>
          <Link
            to="/settings"
            preload="intent"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.22_0.005_270)] text-white/70 active:scale-95"
          >
            <span className="text-base">⚙</span>
          </Link>
        </div>

        {/* Pinned checklists — FIRST */}
        <div className="mt-7 flex items-center justify-between">
          <h2 className="text-on-surface text-sm font-semibold uppercase tracking-wider text-on-surface-muted">
            Quick lists
          </h2>
          <Link to="/checklists" preload="intent" className="text-xs text-on-surface-muted">
            All →
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {pinned.map((c) => {
            const done = c.items.filter((i) => i.done).length;
            const total = c.items.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <Link
                key={c.id}
                to="/checklists/$id"
                params={{ id: c.id }}
                preload="intent"
                className={`relative flex flex-col rounded-3xl p-4 ${colorTile[c.color] ?? colorTile.neutral} shadow-[var(--shadow-card)] active:scale-[0.97]`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-2xl">
                    {c.icon}
                  </div>
                  <Pin className="h-3.5 w-3.5 fill-current opacity-70" />
                </div>
                <p className="mt-6 text-base font-semibold leading-tight">{c.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold opacity-70">{done}/{total}</span>
                </div>
              </Link>
            );
          })}
          <Link
            to="/checklists/new"
            preload="intent"
            className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/15 p-4 text-on-surface-muted active:scale-[0.97]"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">New list</span>
          </Link>
        </div>

        {/* Mark absent today */}
        <button
          onClick={() => {
            if (!hydrated) return;
            toggleAbsence(today);
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
            toast(isAbsentToday ? "Marked present today" : "Marked absent today");
          }}
          className={`mt-5 flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left transition active:scale-[0.98] ${
            isAbsentToday ? "bg-[oklch(0.86_0.09_10)] text-ink" : "bg-[oklch(0.92_0.05_240)] text-ink"
          }`}
        >
          <div>
            <p className="text-xs font-medium opacity-70">
              {isAbsentToday ? "You're marked absent" : "Skipping class today?"}
            </p>
            <p className="text-base font-semibold">
              {isAbsentToday ? "Tap to undo" : "Mark today absent"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-on-surface">
            {isAbsentToday ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </button>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            to="/absences"
            preload="intent"
            className="rounded-3xl bg-white p-4 text-ink shadow-[var(--shadow-card)] active:scale-[0.97]"
          >
            <div className="flex items-center justify-between">
              <CalendarDays className="h-4 w-4 text-ink-muted" />
              <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
            </div>
            <p className="mt-4 text-xl font-semibold">{monthAbs}</p>
            <p className="text-[11px] text-ink-muted">absences this month</p>
          </Link>
          <Link
            to="/checklists"
            preload="intent"
            className="rounded-3xl bg-[oklch(0.22_0.005_270)] p-4 text-on-surface shadow-[var(--shadow-card)] active:scale-[0.97]"
          >
            <div className="flex items-center justify-between">
              <ListChecks className="h-4 w-4 text-white/60" />
              <ChevronRight className="h-3.5 w-3.5 text-white/60" />
            </div>
            <p className="mt-4 text-xl font-semibold">{checklists.length}</p>
            <p className="text-[11px] text-on-surface-muted">lists ready</p>
          </Link>
        </div>
      </div>
    </PhoneShell>
  );
}
