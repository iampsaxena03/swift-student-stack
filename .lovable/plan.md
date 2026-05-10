
# Student Survival — Mobile-first PWA

A premium, phone-only web app with two tools: an Absent Tracker calendar and Smart Checkout Checklists. Local-only (no login, no backend). Installable to the home screen.

## Visual language (from references)
- Mood: pure black surfaces + crisp white cards, large display typography, generous spacing, soft inner shadows, pill buttons, rounded 2xl tiles. Inspired by the cleaning-schedules reference.
- Palette (tokens in `src/styles.css`, oklch):
  - background near-black, foreground near-white, card white-on-black, accent sky-blue pill (like the "1/8" badge), subtle muted greys.
- Type: large bold display for screen titles, medium weight for section labels, comfortable body.
- Motion: spring fade-in/scale-in for screen mounts, satisfying check toggle (scale + checkmark draw), haptic-like press feedback (`active:scale-95`), bottom sheet slide-ups.

## Screens & routes (TanStack Start, file-based)
```
src/routes/
  __root.tsx                    shell, viewport meta, manifest link, Toaster
  index.tsx                     Home — greeting, two big tiles (Absences, Checklists), pinned shortcuts row
  absences.tsx                  Calendar view, tap day to toggle absent, monthly stats, history list
  checklists.tsx                List of all checklists + "New" FAB
  checklists.$id.tsx            Single checklist — items, fast check/uncheck, edit, pin toggle
  checklists.new.tsx            Create checklist (name, emoji/icon, template picker)
  settings.tsx                  Install to home screen instructions, clear data, about
```
A persistent bottom nav (Home / Absences / Checklists / Settings) with active state, safe-area padding, thumb-friendly 56px targets.

## Absent Tracker
- Custom-built monthly calendar (no heavy lib): swipe / arrow to change month, dots on absent days, tap to toggle (confirm via subtle bounce + toast).
- Quick action on Home: "Mark today absent" pill button.
- Stats card: this-month count, current streak of present days, last absence date.
- History list grouped by month, each row shows weekday + date.

## Smart Checkout Checklists
- Templates seeded on first launch: Coaching, Overnight Stay, Travel, Exam, Custom.
- Checklist detail: large tap rows with circular checkbox (animated check), progress ring at top showing X/Y, "Reset all" and "All done!" celebration (confetti-lite via framer-motion).
- Reorder via long-press drag (dnd-kit), swipe-left to delete item.
- Pin shortcut: star toggle. Pinned checklists appear as big tiles on Home for one-tap access.
- "Add to phone home screen" guidance: PWA install prompt + per-checklist deep link (`/checklists/<id>`) so the user can manually add a Safari/Chrome home-screen shortcut to that exact list (closest possible to a real widget).

## Data model (localStorage via a tiny zustand store with persist)
```ts
Absence { date: 'YYYY-MM-DD' }
ChecklistItem { id, text, done }
Checklist { id, name, icon, color, pinned, items: ChecklistItem[], updatedAt }
```
Single store file `src/lib/store.ts`, hydrated client-side only (guard against SSR `window`).

## PWA (manifest only, no service worker)
- Add `public/manifest.json` with name, short_name, theme/background colors, `display: standalone`, icons (generated 192/512 PNG).
- Link manifest + apple-touch-icon + theme-color in `__root.tsx` head.
- No `vite-plugin-pwa`, no service worker (per Lovable PWA guidance) — keeps preview stable; install-to-home still works.

## Tech details
- TanStack Start + Tailwind v4 tokens already in `src/styles.css` — extend with new semantic tokens (surface, surface-muted, accent-blue, ring-soft, gradient-card).
- `framer-motion` for transitions, `dnd-kit/sortable` for reordering, `lucide-react` icons, `date-fns` for calendar math, `zustand` for state, `sonner` for toasts.
- Mobile-first only: max content width 480px, centered on larger screens with subtle device-frame backdrop so desktop preview still looks intentional.
- Safe-area insets via `env(safe-area-inset-*)` on top header and bottom nav.
- Set preview viewport to mobile.

## Out of scope
- No accounts, no cloud sync, no real OS widgets, no notifications/reminders (can be a follow-up).
