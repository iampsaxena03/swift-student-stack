import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, ListChecks, Plus, Pin, ChevronRight } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { useStore, colorTile } from "@/lib/store";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
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
  const pinned = checklists.filter((c) => c.pinned).slice(0, 4);

  return (
    <PhoneShell>
      <div className="px-6 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface-muted">
              {format(new Date(), "EEEE, MMM d")}
            </p>
            <p className="text-on-surface text-lg font-medium">Hey there 👋</p>
          </div>
          <Link
            to="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[oklch(0.22_0.005_270)] text-white/80 active:scale-95"
          >
            <span className="text-lg">⚙</span>
          </Link>
        </div>

        {/* Hero title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-on-surface text-[44px] font-semibold leading-[1.05] tracking-tight"
        >
          Student
          <br />
          survival kit
        </motion.h1>
        <p className="mt-3 max-w-[260px] text-on-surface-muted">
          Track absences. Never forget a thing.
        </p>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            to="/absences"
            className="group rounded-3xl bg-white p-5 text-ink shadow-[var(--shadow-card)] transition active:scale-[0.97]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[oklch(0.95_0.005_270)]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="mt-8 text-2xl font-semibold leading-none">{monthAbs}</p>
            <p className="mt-1 text-xs text-ink-muted">absences this month</p>
            <p className="mt-4 text-sm font-medium">Absences <ChevronRight className="ml-1 inline h-3.5 w-3.5" /></p>
          </Link>
          <Link
            to="/checklists"
            className="rounded-3xl bg-[oklch(0.22_0.005_270)] p-5 text-on-surface shadow-[var(--shadow-card)] active:scale-[0.97]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <ListChecks className="h-5 w-5" />
            </div>
            <p className="mt-8 text-2xl font-semibold leading-none">{checklists.length}</p>
            <p className="mt-1 text-xs text-on-surface-muted">checklists ready</p>
            <p className="mt-4 text-sm font-medium">Checklists <ChevronRight className="ml-1 inline h-3.5 w-3.5" /></p>
          </Link>
        </div>

        {/* Mark absent today */}
        <button
          onClick={() => {
            if (!hydrated) return;
            toggleAbsence(today);
            toast(isAbsentToday ? "Marked present today" : "Marked absent today", {
              description: format(new Date(), "EEEE, MMMM d"),
            });
          }}
          className={`mt-3 flex w-full items-center justify-between rounded-3xl px-5 py-4 text-left transition active:scale-[0.98] ${
            isAbsentToday
              ? "bg-[oklch(0.86_0.09_10)] text-ink"
              : "bg-[oklch(0.92_0.05_240)] text-ink"
          }`}
        >
          <div>
            <p className="text-sm font-medium opacity-70">
              {isAbsentToday ? "You're marked absent" : "Skipping class today?"}
            </p>
            <p className="text-lg font-semibold">
              {isAbsentToday ? "Tap to undo" : "Mark today absent"}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-on-surface">
            <ChevronRight className="h-5 w-5" />
          </div>
        </button>

        {/* Pinned shortcuts */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-on-surface text-base font-semibold">Pinned shortcuts</h2>
          <Link to="/checklists" className="text-on-surface-muted text-xs">See all</Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {pinned.length === 0 && (
            <Link
              to="/checklists/new"
              className="col-span-2 flex items-center gap-3 rounded-3xl border border-dashed border-white/15 p-5 text-on-surface-muted active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              <span>Create your first checklist</span>
            </Link>
          )}
          {pinned.map((c) => {
            const done = c.items.filter((i) => i.done).length;
            return (
              <Link
                key={c.id}
                to="/checklists/$id"
                params={{ id: c.id }}
                className={`relative rounded-3xl p-5 ${colorTile[c.color] ?? colorTile.neutral} shadow-[var(--shadow-card)] active:scale-[0.97]`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-2xl">
                    {c.icon}
                  </div>
                  <Pin className="h-4 w-4 fill-current" />
                </div>
                <p className="mt-8 text-base font-semibold">{c.name}</p>
                <p className="mt-1 text-xs opacity-70">
                  {done}/{c.items.length} ready
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </PhoneShell>
  );
}
