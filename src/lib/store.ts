import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ChecklistItem = { id: string; text: string; done: boolean };
export type Checklist = {
  id: string;
  name: string;
  icon: string;
  color: string;
  pinned: boolean;
  items: ChecklistItem[];
  updatedAt: number;
};

export type HomeworkKind = "today" | "weekend";
export type Subject = "physics" | "chemistry" | "maths";

export type HomeworkEntry = {
  id: string;
  date: string; // YYYY-MM-DD logical day it was logged for
  kind: HomeworkKind;
  subject: Subject;
  dpp?: string;
  modules?: string;
  others?: string;
  createdAt: number;
  weekendEndDate?: string; // YYYY-MM-DD, only for weekend entries (Sunday of that week)
};

export type AppSettings = {
  dailyResetTime: string; // "HH:mm"
};

type State = {
  hydrated: boolean;
  absences: string[];
  checklists: Checklist[];
  homework: HomeworkEntry[];
  settings: AppSettings;
  toggleAbsence: (date: string) => void;
  addChecklist: (c: Omit<Checklist, "id" | "updatedAt">) => string;
  removeChecklist: (id: string) => void;
  updateChecklist: (id: string, patch: Partial<Checklist>) => void;
  togglePin: (id: string) => void;
  addItem: (id: string, text: string) => void;
  toggleItem: (id: string, itemId: string) => void;
  removeItem: (id: string, itemId: string) => void;
  resetChecklist: (id: string) => void;
  reorderItems: (id: string, items: ChecklistItem[]) => void;
  upsertHomework: (e: Omit<HomeworkEntry, "id" | "createdAt">) => string;
  removeHomework: (id: string) => void;
  setDailyResetTime: (t: string) => void;
  setHydrated: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const seed = (): Checklist[] => [
  {
    id: uid(), name: "Coaching", icon: "📚", color: "blue", pinned: true, updatedAt: Date.now(),
    items: [
      { id: uid(), text: "Notebook & pen", done: false },
      { id: uid(), text: "Homework", done: false },
      { id: uid(), text: "Water bottle", done: false },
      { id: uid(), text: "Wallet", done: false },
      { id: uid(), text: "Phone & charger", done: false },
      { id: uid(), text: "ID card", done: false },
    ],
  },
  {
    id: uid(), name: "Exam day", icon: "📝", color: "orange", pinned: true, updatedAt: Date.now(),
    items: [
      { id: uid(), text: "Admit card", done: false },
      { id: uid(), text: "Pens (x3)", done: false },
      { id: uid(), text: "Pencil & eraser", done: false },
      { id: uid(), text: "Calculator", done: false },
      { id: uid(), text: "Watch", done: false },
      { id: uid(), text: "Water bottle", done: false },
    ],
  },
];

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      absences: [],
      checklists: [],
      homework: [],
      settings: { dailyResetTime: "00:00" },
      setHydrated: () => {
        const s = get();
        if (s.checklists.length === 0 && s.absences.length === 0 && s.homework.length === 0) {
          set({ checklists: seed(), hydrated: true });
        } else {
          set({ hydrated: true });
        }
      },
      toggleAbsence: (date) =>
        set((s) => ({
          absences: s.absences.includes(date)
            ? s.absences.filter((d) => d !== date)
            : [...s.absences, date],
        })),
      addChecklist: (c) => {
        const id = uid();
        set((s) => ({ checklists: [{ ...c, id, updatedAt: Date.now() }, ...s.checklists] }));
        return id;
      },
      removeChecklist: (id) =>
        set((s) => ({ checklists: s.checklists.filter((c) => c.id !== id) })),
      updateChecklist: (id, patch) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
          ),
        })),
      togglePin: (id) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c,
          ),
        })),
      addItem: (id, text) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id
              ? { ...c, items: [...c.items, { id: uid(), text, done: false }], updatedAt: Date.now() }
              : c,
          ),
        })),
      toggleItem: (id, itemId) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id
              ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, done: !i.done } : i), updatedAt: Date.now() }
              : c,
          ),
        })),
      removeItem: (id, itemId) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id ? { ...c, items: c.items.filter((i) => i.id !== itemId), updatedAt: Date.now() } : c,
          ),
        })),
      resetChecklist: (id) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id
              ? { ...c, items: c.items.map((i) => ({ ...i, done: false })), updatedAt: Date.now() }
              : c,
          ),
        })),
      reorderItems: (id, items) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id ? { ...c, items, updatedAt: Date.now() } : c,
          ),
        })),
      upsertHomework: (e) => {
        const id = uid();
        set((s) => ({ homework: [{ ...e, id, createdAt: Date.now() }, ...s.homework] }));
        return id;
      },
      removeHomework: (id) =>
        set((s) => ({ homework: s.homework.filter((h) => h.id !== id) })),
      setDailyResetTime: (t) =>
        set((s) => ({ settings: { ...s.settings, dailyResetTime: t } })),
    }),
    {
      name: "student-survival-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as unknown as Storage),
      ),
      skipHydration: true,
    },
  ),
);

export const colorTile: Record<string, string> = {
  blue: "bg-[oklch(0.85_0.08_240)] text-[oklch(0.16_0.005_270)]",
  green: "bg-[oklch(0.86_0.09_150)] text-[oklch(0.16_0.005_270)]",
  orange: "bg-[oklch(0.85_0.11_60)] text-[oklch(0.16_0.005_270)]",
  purple: "bg-[oklch(0.84_0.09_300)] text-[oklch(0.16_0.005_270)]",
  pink: "bg-[oklch(0.86_0.09_10)] text-[oklch(0.16_0.005_270)]",
  neutral: "bg-white text-[oklch(0.16_0.005_270)]",
};

// ============= Homework helpers =============

export const SUBJECTS: { key: Subject; label: string; icon: string; color: string }[] = [
  { key: "physics", label: "Physics", icon: "⚛️", color: "oklch(0.85 0.08 240)" },
  { key: "chemistry", label: "Chemistry", icon: "🧪", color: "oklch(0.86 0.09 150)" },
  { key: "maths", label: "Maths", icon: "📐", color: "oklch(0.85 0.11 60)" },
];

const pad = (n: number) => n.toString().padStart(2, "0");
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Logical date for the "today" homework, considering reset time.
 * If now is before today's reset time, logical date = yesterday.
 * Otherwise logical date = today.
 */
export function logicalToday(now: Date, resetTime: string): string {
  const [h, m] = resetTime.split(":").map((x) => parseInt(x, 10));
  const cutoff = new Date(now);
  cutoff.setHours(h || 0, m || 0, 0, 0);
  const d = new Date(now);
  if (now.getTime() < cutoff.getTime()) d.setDate(d.getDate() - 1);
  return fmtDate(d);
}

/** Upcoming Sunday on or after date (YYYY-MM-DD). */
export function upcomingSunday(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0=Sun
  const offset = (7 - day) % 7;
  dt.setDate(dt.getDate() + offset);
  return fmtDate(dt);
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function getHomeworkForDate(
  all: HomeworkEntry[],
  date: string,
): { today: HomeworkEntry[]; weekend: HomeworkEntry[] } {
  const today = all.filter((h) => h.kind === "today" && h.date === date);
  const weekend = all.filter(
    (h) => h.kind === "weekend" && h.weekendEndDate && isDateInRange(date, h.date, h.weekendEndDate),
  );
  return { today, weekend };
}
