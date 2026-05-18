## Homework Tracker + Vercel-ready deploy

A new top-priority feature on Slyve: a daily / weekend Homework Tracker with per-subject entries, a calendar history view, configurable daily reset, and a Vercel-safe build.

---

### 1. Data model (extend `src/lib/store.ts`)

```ts
type HomeworkKind = "today" | "weekend";
type Subject = "physics" | "chemistry" | "maths";

type HomeworkEntry = {
  id: string;
  date: string;        // YYYY-MM-DD the entry was logged
  kind: HomeworkKind;  // today | weekend
  subject: Subject;
  dpp?: string;
  modules?: string;
  others?: string;
  createdAt: number;
  // weekend entries are valid from `date` through the upcoming Sunday
  weekendEndDate?: string;
};
```

Store additions:
- `homework: HomeworkEntry[]`
- `settings: { dailyResetTime: string /* "HH:mm", default "00:00" */ }`
- Actions: `upsertHomework(entry)`, `removeHomework(id)`, `setDailyResetTime(time)`
- Selectors:
  - `getTodayHomework(now)` → entries whose "logical day" (shifted by reset time) equals today's logical day, kind === "today".
  - `getWeekendHomework(date)` → kind === "weekend" entries whose `[date, weekendEndDate]` range contains `date`.
  - `getHomeworkForDate(date)` → both "today" entries for that logical day and all "weekend" entries active on that date.

Logical-day rule: a "today" entry logged at time T belongs to the day window `[lastReset(T), nextReset(T))`. So if reset = 10:30, anything logged 03:00 Tue still belongs to Mon's homework until 10:30 Tue.

---

### 2. Home screen (`src/routes/index.tsx`)

New top-down order:

```
[date row + ⚙]
[Homework card — TOP, above Quick lists]
   - Toggle: Today | Weekend
   - For each subject (Physics, Chemistry, Maths) with any non-empty field:
       subject pill + DPP / Modules / Others lines
   - Subjects with no homework are hidden (not shown as empty)
   - "Weekend" entries show their active window: "Wed → Sun"
   - Empty state: "No homework yet — tap + to add"
[Quick lists grid]
[+ New list tile]
[Mark today absent pill]
[Stats row]
```

Card visual: rounded-3xl surface, subject color dot, monospace-ish DPP text, soft dividers — matches existing premium look.

---

### 3. Floating dock `+` → Add homework flow

Rework `BottomNav.tsx` center FAB:

- `+` now opens a bottom sheet (Radix Drawer/Sheet) instead of routing to `/checklists/new`.
- Step 1: pick subject — 3 large tiles: Physics ⚛️, Chemistry 🧪, Maths 📐.
- Step 2: form with three optional fields — DPP, Modules, Others (all textareas, all optional, at least one required).
- Top toggle in the sheet: Today | Weekend (defaults to the toggle currently active on home).
- Submit → `upsertHomework`, close sheet, toast "Saved".
- Checklist creation moves to a small "+ New list" tile already on home (already exists).

(If user prefers a dedicated route over sheet, easy to swap — using sheet for speed/feel.)

---

### 4. Homework Calendar — new route + dock slot

- New route: `src/routes/homework.tsx`
  - Reuses `Calendar.tsx` (extended to accept a `markedDates: Set<string>` and `onSelect(date)` prop instead of toggle).
  - Below the calendar: details panel for the selected date, grouped by subject (same renderer as home card). Shows both "today" homework logged on that logical day and "weekend" homework active that date (with badge "Weekend · Wed → Sun").
- Dock: 4 slots + center FAB → Home · Absences · `+` · Homework 📓 · Checklists. (Settings stays reachable via gear icon on home.)
- `Calendar.tsx` extended: optional `dotColor` per date, larger thumb tap targets already planned.

---

### 5. Settings — daily reset time

`src/routes/settings.tsx`:
- New section "Homework".
- Time input (`<input type="time">`) bound to `settings.dailyResetTime`.
- Helper text: "Today's homework will reset every day at this time. Weekend homework is not affected."
- Persisted via zustand (already on localStorage).

---

### 6. Weekend window logic

When saving a weekend entry on date D:
- `weekendEndDate` = the upcoming Sunday (if D is Sunday, that same Sunday).
- `getWeekendHomework(target)` returns entries where `D <= target <= weekendEndDate`.
- Home "Weekend" toggle shows weekend homework active for today.
- Calendar shows it on every day in that range, with a small "Weekend" tag and the range text.

---

### 7. Vercel deployment fix

Root cause of the previous 404: this project is TanStack Start on Cloudflare Workers (`wrangler.jsonc`, `@cloudflare/vite-plugin`, `src/server.ts`). Deploying the Vite client `dist/` to Vercel as a static SPA breaks on refresh because Vercel doesn't know to fall back to `index.html` and there is no Worker entry to serve SSR.

Plan:

1. Add `vercel.json` at repo root with SPA rewrite + asset caching:
   ```json
   {
     "cleanUrls": true,
     "trailingSlash": false,
     "rewrites": [{ "source": "/((?!api|assets|.*\\..*).*)", "destination": "/index.html" }],
     "headers": [
       { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
       { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
     ]
   }
   ```
2. Ensure the build emits a static client bundle Vercel can serve:
   - Add an SPA build script: `"build:spa": "vite build --mode spa"` that disables the Cloudflare worker plugin (env flag) and outputs `dist/`.
   - Or simpler: document `outputDirectory: dist/client` in `vercel.json` and rely on TanStack Start's prerender to emit static HTML for known routes; add `prerender: { enabled: true, routes: ["/", "/absences", "/checklists", "/homework", "/settings"] }`.
3. Confirm the SW path: `public/sw.js` is served at `/sw.js` on Vercel too — registration guard in `src/start.ts` already skips on preview hosts; it will run on the Vercel domain.
4. Set Vercel project settings (documented in chat after deploy):
   - Framework preset: Other
   - Build command: `bun run build` (or the new `build:spa`)
   - Output dir: `dist/client`
5. Verify `<Link>` routes use TanStack file routes (they do); no `BrowserRouter` needed. The rewrite handles deep-link 404s.

If Lovable Cloud / Worker SSR features are required later, the user should deploy via Lovable's published URL (already working at `slyve.lovable.app`) — Vercel will run as a static PWA mirror.

---

### Files to change

- `src/lib/store.ts` — schema + actions + selectors + settings
- `src/routes/index.tsx` — Homework card at top, toggle, reorder
- `src/routes/homework.tsx` — NEW calendar + per-day detail
- `src/routes/settings.tsx` — reset time control
- `src/components/BottomNav.tsx` — Homework slot, FAB → AddHomeworkSheet
- `src/components/AddHomeworkSheet.tsx` — NEW (subject → fields)
- `src/components/HomeworkList.tsx` — NEW (shared renderer)
- `src/components/Calendar.tsx` — marked dates + select callback
- `src/routeTree.gen.ts` — regenerated by router plugin
- `vercel.json` — NEW
- `package.json` — optional `build:spa` script
- `src/styles.css` — minor token additions if needed

### Out of scope
- Notifications/reminders when reset time hits.
- Editing past homework on dates other than today (read-only history in calendar; can be added later).
- Cloud sync.

### Confirm before I build
1. Add-homework UI as a **bottom sheet** from the `+` FAB (fast, no route change) — OK, or do you want a full `/homework/new` page?
2. Dock layout: replace one of the existing slots with Homework? Suggested order: **Home · Absences · `+` · Homework · Checklists** (Settings via gear icon). OK?
3. Weekend reset day: fixed to **Sunday end-of-day**, correct?
