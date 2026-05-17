import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { useStore, colorTile } from "@/lib/store";
import { toast } from "sonner";

const ICONS = ["📚", "📝", "🌙", "✈️", "🎒", "💼", "🏋️", "🎮", "☕", "🛒", "🏥", "🎬"];
const COLORS = ["blue", "green", "orange", "purple", "pink", "neutral"] as const;

const TEMPLATES: Record<string, string[]> = {
  Blank: [],
  Coaching: ["Notebook", "Homework", "Water bottle", "Wallet", "Phone & charger"],
  Travel: ["ID / Passport", "Tickets", "Power bank", "Snacks", "Headphones"],
  Exam: ["Admit card", "Pens (x3)", "Pencil & eraser", "Calculator", "Watch"],
  Overnight: ["Toothbrush", "Clothes", "Charger", "Earphones", "Medicines"],
  Gym: ["Towel", "Water bottle", "Shoes", "Earphones", "Shaker"],
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const Route = createFileRoute("/checklists/new")({
  component: NewChecklist,
});

function NewChecklist() {
  const navigate = useNavigate();
  const addChecklist = useStore((s) => s.addChecklist);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState<typeof COLORS[number]>("blue");
  const [template, setTemplate] = useState("Blank");
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);
  const [draftItem, setDraftItem] = useState("");

  const applyTemplate = (t: string) => {
    setTemplate(t);
    setItems((TEMPLATES[t] ?? []).map((text) => ({ id: uid(), text })));
    if (t !== "Blank") toast(`${t} template loaded`);
  };

  const updateItem = (id: string, text: string) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, text } : i)));
  const removeItem = (id: string) => setItems((arr) => arr.filter((i) => i.id !== id));
  const addItem = () => {
    const v = draftItem.trim();
    if (!v) return;
    setItems((arr) => [...arr, { id: uid(), text: v }]);
    setDraftItem("");
  };

  const create = () => {
    if (!name.trim()) return;
    const cleaned = items.filter((i) => i.text.trim()).map((i) => ({ id: i.id, text: i.text.trim(), done: false }));
    const id = addChecklist({ name: name.trim(), icon, color, pinned: false, items: cleaned });
    navigate({ to: "/checklists/$id", params: { id } });
  };

  return (
    <PhoneShell hideNav>
      <div className="px-5 pt-10 pb-10">
        <div className="flex items-center justify-between">
          <Link
            to="/checklists"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.22_0.005_270)] text-white/80 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <button
            onClick={create}
            disabled={!name.trim()}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink active:scale-95 disabled:opacity-40"
          >
            Create
          </button>
        </div>

        <h1 className="text-on-surface mt-5 text-3xl font-semibold tracking-tight">New list</h1>

        <div className="mt-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your list"
            autoFocus
            className="text-on-surface placeholder:text-white/30 w-full rounded-2xl bg-[oklch(0.22_0.005_270)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[oklch(0.92_0.05_240)]"
          />
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-on-surface-muted">Icon</p>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`flex aspect-square items-center justify-center rounded-2xl text-xl active:scale-90 ${
                  icon === i ? "bg-white" : "bg-[oklch(0.22_0.005_270)]"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-on-surface-muted">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded-full ${colorTile[c]} ${
                  color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[oklch(0.16_0.005_270)]" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-on-surface-muted">Start from</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(TEMPLATES).map((t) => (
              <button
                key={t}
                onClick={() => applyTemplate(t)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
                  template === t ? "bg-white text-ink" : "bg-[oklch(0.22_0.005_270)] text-on-surface-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-on-surface-muted">Items</p>
          <div className="mt-2 space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-ink">
                <input
                  value={it.text}
                  onChange={(e) => updateItem(it.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button
                  onClick={() => removeItem(it.id)}
                  aria-label="Remove"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted active:scale-90"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <form
              onSubmit={(e) => { e.preventDefault(); addItem(); }}
              className="flex items-center gap-2 rounded-2xl bg-[oklch(0.22_0.005_270)] px-3 py-1"
            >
              <Plus className="h-4 w-4 text-white/50" />
              <input
                value={draftItem}
                onChange={(e) => setDraftItem(e.target.value)}
                placeholder="Add an item"
                className="flex-1 bg-transparent py-2 text-sm text-on-surface placeholder:text-white/40 focus:outline-none"
              />
              {draftItem && (
                <button type="submit" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink active:scale-95">
                  Add
                </button>
              )}
            </form>
          </div>
        </div>

        <button
          onClick={create}
          disabled={!name.trim()}
          className="mt-8 w-full rounded-full bg-white py-4 text-base font-semibold text-ink transition active:scale-[0.98] disabled:opacity-40"
        >
          Create list
        </button>
      </div>
    </PhoneShell>
  );
}
