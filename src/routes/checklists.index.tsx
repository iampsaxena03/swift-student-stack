import { createFileRoute, Link } from "@tanstack/react-router";
import { Pin, Plus, ChevronRight, Trash2, PinOff } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { useStore, colorTile } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checklists/")({
  head: () => ({
    meta: [
      { title: "Checklists · Slyve" },
      { name: "description", content: "All your checkout checklists in one tap." },
    ],
  }),
  component: ChecklistsPage,
});

function ChecklistsPage() {
  const checklists = useStore((s) => s.checklists);
  const togglePin = useStore((s) => s.togglePin);
  const removeChecklist = useStore((s) => s.removeChecklist);
  const pinned = checklists.filter((c) => c.pinned);
  const others = checklists.filter((c) => !c.pinned);

  return (
    <PhoneShell>
      <div className="px-6 pt-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-on-surface-muted text-sm">Smart checkout</p>
            <h1 className="text-on-surface mt-1 text-3xl font-semibold tracking-tight">
              Checklists
            </h1>
          </div>
          <Link
            to="/checklists/new"
            className="flex h-11 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink active:scale-95"
          >
            <Plus className="h-4 w-4" /> New
          </Link>
        </div>

        {pinned.length > 0 && (
          <>
            <p className="text-on-surface-muted mt-7 text-xs uppercase tracking-wider">Pinned</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
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
          </>
        )}

        <p className="text-on-surface-muted mt-7 text-xs uppercase tracking-wider">All lists</p>
        <div className="mt-3 overflow-hidden rounded-3xl bg-[oklch(0.22_0.005_270)]">
          {others.length === 0 && pinned.length === 0 && (
            <Link
              to="/checklists/new"
              className="flex items-center justify-center gap-2 px-4 py-8 text-on-surface-muted"
            >
              <Plus className="h-4 w-4" /> Create your first checklist
            </Link>
          )}
          {others.map((c, idx) => {
            const done = c.items.filter((i) => i.done).length;
            return (
              <div
                key={c.id}
                className={`flex items-center gap-2 px-3 py-3 ${idx > 0 ? "border-t border-white/5" : ""}`}
              >
                <Link
                  to="/checklists/$id"
                  params={{ id: c.id }}
                  preload="intent"
                  className="flex flex-1 items-center gap-3 active:opacity-70"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl">
                    {c.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-on-surface text-sm font-semibold">{c.name}</p>
                    <p className="text-on-surface-muted text-xs">
                      {done}/{c.items.length} ready
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => { togglePin(c.id); toast(c.pinned ? "Unpinned" : "Pinned"); }}
                  aria-label="Toggle pin"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 active:scale-90"
                >
                  {c.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${c.name}"?`)) removeChecklist(c.id); }}
                  aria-label="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 active:scale-90"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </div>
            );
          })}
        </div>
      </div>
    </PhoneShell>
  );
}