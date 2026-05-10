import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { useStore, colorTile } from "@/lib/store";

const ICONS = ["📚", "📝", "🌙", "✈️", "🎒", "💼", "🏋️", "🎮", "☕", "🛒", "🏥", "🎬"];
const COLORS = ["blue", "green", "orange", "purple", "pink", "neutral"] as const;

const TEMPLATES: Record<string, string[]> = {
  blank: [],
  Coaching: ["Notebook", "Homework", "Water bottle", "Wallet", "Phone & charger"],
  Travel: ["ID / Passport", "Tickets", "Power bank", "Snacks", "Headphones"],
  Exam: ["Admit card", "Pens (x3)", "Pencil & eraser", "Calculator", "Watch"],
  Overnight: ["Toothbrush", "Clothes", "Charger", "Earphones", "Medicines"],
};

export const Route = createFileRoute("/checklists/new")({
  component: NewChecklist,
});

function NewChecklist() {
  const navigate = useNavigate();
  const addChecklist = useStore((s) => s.addChecklist);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState<typeof COLORS[number]>("blue");
  const [template, setTemplate] = useState("blank");

  const create = () => {
    if (!name.trim()) return;
    const items = (TEMPLATES[template] ?? []).map((text) => ({
      id: Math.random().toString(36).slice(2, 10),
      text,
      done: false,
    }));
    const id = addChecklist({ name: name.trim(), icon, color, pinned: false, items });
    navigate({ to: "/checklists/$id", params: { id } });
  };

  return (
    <PhoneShell hideNav>
      <div className="px-6 pt-12">
        <div className="flex items-center justify-between">
          <Link
            to="/checklists"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[oklch(0.22_0.005_270)] text-white/80 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>

        <h1 className="text-on-surface mt-6 text-3xl font-semibold tracking-tight">
          New checklist
        </h1>
        <p className="text-on-surface-muted mt-1 text-sm">For when you can't afford to forget.</p>

        <div className="mt-7">
          <label className="text-on-surface-muted text-xs uppercase tracking-wider">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Gym day"
            autoFocus
            className="text-on-surface placeholder:text-white/30 mt-2 w-full rounded-2xl bg-[oklch(0.22_0.005_270)] px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[oklch(0.92_0.05_240)]"
          />
        </div>

        <div className="mt-6">
          <label className="text-on-surface-muted text-xs uppercase tracking-wider">Icon</label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`flex aspect-square items-center justify-center rounded-2xl text-2xl transition active:scale-90 ${
                  icon === i
                    ? "bg-white"
                    : "bg-[oklch(0.22_0.005_270)]"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-on-surface-muted text-xs uppercase tracking-wider">Color</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-10 w-10 rounded-full ${colorTile[c]} ${
                  color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[oklch(0.16_0.005_270)]" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-on-surface-muted text-xs uppercase tracking-wider">
            Start from
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(TEMPLATES).map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
                  template === t
                    ? "bg-white text-ink"
                    : "bg-[oklch(0.22_0.005_270)] text-on-surface-muted"
                }`}
              >
                {t === "blank" ? "Blank" : t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={create}
          disabled={!name.trim()}
          className="mt-10 w-full rounded-full bg-white py-4 text-base font-semibold text-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          Create checklist
        </button>
      </div>
    </PhoneShell>
  );
}