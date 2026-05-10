import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Pin, Plus, RotateCcw, Trash2, Check } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PhoneShell } from "@/components/PhoneShell";
import { useStore, type ChecklistItem } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checklists/$id")({
  component: ChecklistDetail,
});

function ChecklistDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const list = useStore((s) => s.checklists.find((c) => c.id === id));
  const toggleItem = useStore((s) => s.toggleItem);
  const addItem = useStore((s) => s.addItem);
  const removeItem = useStore((s) => s.removeItem);
  const removeChecklist = useStore((s) => s.removeChecklist);
  const togglePin = useStore((s) => s.togglePin);
  const reset = useStore((s) => s.resetChecklist);
  const reorderItems = useStore((s) => s.reorderItems);

  const [adding, setAdding] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (!list) {
    return (
      <PhoneShell>
        <div className="flex h-full items-center justify-center px-6 pt-24 text-center text-on-surface-muted">
          <div>
            <p className="text-on-surface text-lg font-semibold">Checklist not found</p>
            <Link to="/checklists" className="mt-3 inline-block text-sm underline">
              Back to lists
            </Link>
          </div>
        </div>
      </PhoneShell>
    );
  }

  const done = list.items.filter((i) => i.done).length;
  const total = list.items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = list.items.findIndex((i) => i.id === active.id);
    const newIdx = list.items.findIndex((i) => i.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    reorderItems(list.id, arrayMove(list.items, oldIdx, newIdx));
  };

  return (
    <PhoneShell>
      <div className="px-6 pt-12">
        <div className="flex items-center justify-between">
          <Link
            to="/checklists"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[oklch(0.22_0.005_270)] text-white/80 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="rounded-full bg-[oklch(0.92_0.05_240)] px-3 py-1 text-xs font-semibold text-ink">
            {done}/{total}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-ink">
            {list.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-on-surface text-2xl font-semibold tracking-tight">{list.name}</h1>
            <p className="text-on-surface-muted text-xs">{pct}% ready to go</p>
          </div>
          <button
            aria-label="Pin"
            onClick={() => togglePin(list.id)}
            className={`flex h-11 w-11 items-center justify-center rounded-full active:scale-90 ${
              list.pinned ? "bg-white text-ink" : "bg-[oklch(0.22_0.005_270)] text-white/80"
            }`}
          >
            <Pin className={`h-4 w-4 ${list.pinned ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[oklch(0.86_0.09_150)]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {pct === 100 && total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-center gap-3 rounded-2xl bg-[oklch(0.86_0.09_150)] px-4 py-3 text-ink"
          >
            <span className="text-2xl">🎉</span>
            <p className="text-sm font-semibold">All set! You're good to go.</p>
          </motion.div>
        )}

        {/* Items */}
        <div className="mt-6 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={list.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                {list.items.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(list.id, item.id)}
                    onRemove={() => removeItem(list.id, item.id)}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>

        {/* Add item */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = adding.trim();
            if (!v) return;
            addItem(list.id, v);
            setAdding("");
          }}
          className="mt-3 flex items-center gap-2 rounded-2xl bg-[oklch(0.22_0.005_270)] px-3 py-2"
        >
          <Plus className="h-4 w-4 text-white/50" />
          <input
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            placeholder="Add an item..."
            className="flex-1 bg-transparent py-2 text-sm text-on-surface placeholder:text-white/40 focus:outline-none"
          />
          {adding && (
            <button
              type="submit"
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink active:scale-95"
            >
              Add
            </button>
          )}
        </form>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              reset(list.id);
              toast("Reset all items");
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[oklch(0.22_0.005_270)] py-3 text-sm font-medium text-on-surface active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${list.name}"?`)) {
                removeChecklist(list.id);
                navigate({ to: "/checklists" });
              }
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.22_0.005_270)] text-on-surface active:scale-90"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}

function SortableRow({
  item,
  onToggle,
  onRemove,
}: {
  item: ChecklistItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[var(--shadow-soft)] ${
        isDragging ? "ring-2 ring-[oklch(0.92_0.05_240)]" : ""
      }`}
    >
      <button
        onClick={onToggle}
        aria-label="Toggle"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90 ${
          item.done
            ? "border-ink bg-ink text-white"
            : "border-[oklch(0.85_0.005_270)] bg-white"
        }`}
      >
        {item.done && <Check className="animate-check-pop h-4 w-4" strokeWidth={3} />}
      </button>
      <span
        className={`flex-1 text-sm font-medium select-none ${
          item.done ? "text-ink-muted line-through" : "text-ink"
        }`}
        {...attributes}
        {...listeners}
      >
        {item.text}
      </span>
      <button
        onClick={onRemove}
        className="text-ink-muted opacity-0 transition group-hover:opacity-100 active:scale-90"
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}