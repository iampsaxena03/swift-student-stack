import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ChecklistItem = { id: string; text: string; done: boolean };
export type Checklist = {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // token name: blue|green|orange|purple|pink|neutral
  pinned: boolean;
  items: ChecklistItem[];
  updatedAt: number;
};

type State = {
  hydrated: boolean;
  absences: string[]; // YYYY-MM-DD
  checklists: Checklist[];
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
  setHydrated: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const seed = (): Checklist[] => [
  {
    id: uid(),
    name: "Coaching",
    icon: "📚",
    color: "blue",
    pinned: true,
    updatedAt: Date.now(),
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
    id: uid(),
    name: "Exam day",
    icon: "📝",
    color: "orange",
    pinned: true,
    updatedAt: Date.now(),
    items: [
      { id: uid(), text: "Admit card", done: false },
      { id: uid(), text: "Pens (x3)", done: false },
      { id: uid(), text: "Pencil & eraser", done: false },
      { id: uid(), text: "Calculator", done: false },
      { id: uid(), text: "Watch", done: false },
      { id: uid(), text: "Water bottle", done: false },
    ],
  },
  {
    id: uid(),
    name: "Overnight stay",
    icon: "🌙",
    color: "purple",
    pinned: false,
    updatedAt: Date.now(),
    items: [
      { id: uid(), text: "Toothbrush", done: false },
      { id: uid(), text: "Change of clothes", done: false },
      { id: uid(), text: "Charger", done: false },
      { id: uid(), text: "Earphones", done: false },
      { id: uid(), text: "Medicines", done: false },
    ],
  },
  {
    id: uid(),
    name: "Travel",
    icon: "✈️",
    color: "green",
    pinned: false,
    updatedAt: Date.now(),
    items: [
      { id: uid(), text: "ID / Passport", done: false },
      { id: uid(), text: "Tickets", done: false },
      { id: uid(), text: "Power bank", done: false },
      { id: uid(), text: "Snacks", done: false },
      { id: uid(), text: "Headphones", done: false },
    ],
  },
];

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      absences: [],
      checklists: [],
      setHydrated: () => {
        const s = get();
        if (s.checklists.length === 0 && s.absences.length === 0) {
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
              ? {
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId ? { ...i, done: !i.done } : i,
                  ),
                  updatedAt: Date.now(),
                }
              : c,
          ),
        })),
      removeItem: (id, itemId) =>
        set((s) => ({
          checklists: s.checklists.map((c) =>
            c.id === id
              ? { ...c, items: c.items.filter((i) => i.id !== itemId), updatedAt: Date.now() }
              : c,
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