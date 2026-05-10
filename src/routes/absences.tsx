import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { PhoneShell } from "@/components/PhoneShell";
import { Calendar } from "@/components/Calendar";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/absences")({
  head: () => ({
    meta: [
      { title: "Absences — Pocket" },
      { name: "description", content: "See every day you missed at a glance." },
    ],
  }),
  component: AbsencesPage,
});

function AbsencesPage() {
  const absences = useStore((s) => s.absences);
  const toggle = useStore((s) => s.toggleAbsence);

  const sorted = [...absences].sort().reverse();
  const monthKey = format(new Date(), "yyyy-MM");
  const thisMonth = absences.filter((d) => d.startsWith(monthKey)).length;
  const last = sorted[0];

  // Group by month
  const groups = sorted.reduce<Record<string, string[]>>((acc, d) => {
    const k = d.slice(0, 7);
    (acc[k] ??= []).push(d);
    return acc;
  }, {});

  return (
    <PhoneShell>
      <div className="px-6 pt-12">
        <p className="text-on-surface-muted text-sm">Tracker</p>
        <h1 className="text-on-surface mt-1 text-3xl font-semibold tracking-tight">Absences</h1>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[oklch(0.22_0.005_270)] p-4">
            <p className="text-on-surface-muted text-xs">This month</p>
            <p className="text-on-surface mt-2 text-3xl font-semibold">{thisMonth}</p>
          </div>
          <div className="rounded-2xl bg-[oklch(0.22_0.005_270)] p-4">
            <p className="text-on-surface-muted text-xs">Total</p>
            <p className="text-on-surface mt-2 text-3xl font-semibold">{absences.length}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Calendar
            absences={absences}
            onToggle={(d) => {
              const wasAbsent = absences.includes(d);
              toggle(d);
              toast(wasAbsent ? "Removed absence" : "Marked absent", {
                description: format(parseISO(d), "EEEE, MMM d"),
              });
            }}
          />
        </motion.div>

        {last && (
          <p className="text-on-surface-muted mt-4 text-xs">
            Last absence: {format(parseISO(last), "EEEE, MMM d, yyyy")}
          </p>
        )}

        <div className="mt-8">
          <h2 className="text-on-surface text-base font-semibold">History</h2>
          {Object.keys(groups).length === 0 && (
            <p className="text-on-surface-muted mt-3 text-sm">
              No absences yet. Tap a day in the calendar to log one.
            </p>
          )}
          <div className="mt-3 space-y-5">
            {Object.entries(groups).map(([k, ds]) => (
              <div key={k}>
                <p className="text-on-surface-muted text-xs uppercase tracking-wider">
                  {format(parseISO(k + "-01"), "MMMM yyyy")} · {ds.length}
                </p>
                <div className="mt-2 overflow-hidden rounded-2xl bg-[oklch(0.22_0.005_270)]">
                  {ds.map((d, i) => (
                    <div
                      key={d}
                      className={`flex items-center justify-between px-4 py-3 ${
                        i > 0 ? "border-t border-white/5" : ""
                      }`}
                    >
                      <div>
                        <p className="text-on-surface text-sm font-medium">
                          {format(parseISO(d), "EEEE")}
                        </p>
                        <p className="text-on-surface-muted text-xs">
                          {format(parseISO(d), "MMM d, yyyy")}
                        </p>
                      </div>
                      <button
                        onClick={() => toggle(d)}
                        className="text-on-surface-muted text-xs underline-offset-4 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}