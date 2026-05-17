## 1. Rebrand: Pocket → Slyve (everywhere)

- `public/manifest.json`: `name`, `short_name`, `description` → "Slyve".
- `src/routes/__root.tsx`: already shows "Slyve" in title/OG — double-check description, twitter strings all say Slyve.
- Remove every "Pocket" string from `settings.tsx` (eyebrow + "About Pocket" row), `checklists.index.tsx` head title, `absences.tsx` head title.
- Remove the "Student survival kit" hero on `src/routes/index.tsx`. Replace with a single, clean "Slyve" wordmark + a one-line subtitle (or nothing).
- Update the icon set so the installed home-screen tile shows the Slyve mark. Regenerate `public/icon-192.png` and `public/icon-512.png` with a simple "S" / Slyve glyph (so when added to the home screen, label = Slyve, icon = Slyve).
- Set `<title>` and og:title to plain "Slyve" on home; sub-pages become "Checklists · Slyve", "Absences · Slyve", etc.

## 2. Restructure the home page

New top-down order on `src/routes/index.tsx`:

```text
[small date row + settings cog]
[Pinned checklist tiles — BIG, 2-col grid, first thing visible]
[“+ New checklist” inline tile if there’s room]
[Mark today absent pill]
[Small stats row: absences this month · total checklists]
```

- Pinned shortcuts move to the top, sized larger (taller tiles, bigger icon, name + ready count).
- Quick-action tiles (Absences/Checklists count) demoted to a compact 2-up row near the bottom.
- “Mark today absent” stays as a single tap pill, placed right under pinned tiles.
- If no pinned lists exist, show a “Pin a list for one-tap access” empty state with a CTA to `/checklists`.

## 3. Editable templates in “New checklist”

`src/routes/checklists.new.tsx`:

- After picking a template (or Blank), render the seeded items inline as an editable list:
  - Each row: text input + trash button → removes from local draft.
  - Bottom row: “+ Add item” inline input.
- Internal state becomes `draftItems: {id, text}[]` instead of just a template key.
- “Create checklist” uses `draftItems` (so any deletions/additions/edits are respected).
- Switching template repopulates `draftItems` from that template (with a small toast: “Template applied”).

## 4. Floating dock bottom nav (iPhone-style)

Rework `src/components/BottomNav.tsx` + `PhoneShell`:

- Use `position: fixed` (not absolute), pinned to the bottom of the viewport so it floats over content as you scroll.
- Inside `.phone-shell`: keep it visually centered with `max-width: 440px` and `left/right: 0; margin-inline: auto;`.
- Visual: blurred rounded-3xl pill (`backdrop-blur-xl`, semi-transparent dark surface, subtle white ring, drop shadow), 64px tall, icons larger (24px), active item gets a white circular “lens” behind the icon plus the label. Inactive items: icon only, muted.
- Add a center FAB-style "+" button (the dock’s middle slot) that goes to `/checklists/new` from anywhere — primary action.
- Bottom offset uses `env(safe-area-inset-bottom)` with extra 12px so it sits above the iOS home indicator.
- Content padding-bottom bumped to ~120px so the dock never overlaps content.
- Hide dock on `/checklists/new` (already supported via `hideNav`) and on `/checklists/$id` editing form when keyboard is open (CSS only, optional).

## 5. Extra quality-of-life features

- **Long-press / swipe to delete checklists** from `checklists.index.tsx` — add a small ⋯ menu on each row with Pin / Rename / Delete.
- **Edit checklist title + icon** from the detail view (tap the title to rename).
- **Absence streak / last-absent label** on home next to the “mark today absent” pill.
- **Haptic feedback** via `navigator.vibrate(10)` on toggle/check (no-op on iOS but works on Android).
- **Share / Duplicate checklist**: a duplicate action so users can fork a template they’ve customized.
- **“Reset all checked items” FAB on checklist detail** already exists — promote it visually.
- **Empty calendar cell tap target** enlarged for thumb taps on `Calendar.tsx`.

## 6. Performance — make it feel instant after install

Root causes today:
- No service worker, so every nav refetches the HTML shell over the network. After "install" the PWA is just a web view hitting the server.
- `PhoneShell` calls `useStore.persist.rehydrate()` on each route mount; cheap but unnecessary repaint.
- Some route mount animations (framer-motion) add perceived latency.

Fixes:

1. **Add a minimal, properly-guarded PWA service worker** (Lovable-safe):
   - Install `vite-plugin-pwa` with `registerType: 'autoUpdate'`, `devOptions.enabled: false`.
   - `workbox.runtimeCaching`:
     - HTML navigations → `NetworkFirst` (3s timeout, fall back to cache → instant repeat navigations).
     - JS/CSS/static assets → `StaleWhileRevalidate`.
     - Images / icons / manifest → `CacheFirst` with 30-day expiration.
   - `navigateFallbackDenylist: [/^\/api\//, /^\/~oauth/]`.
   - Registration guard in `src/start.ts` / client entry: skip if `window.self !== window.top` OR hostname includes `id-preview--` / `lovableproject.com`; in those contexts, unregister any existing SW.
   - Warn user in chat: SW only activates on the published deploy, not the editor preview.

2. **Prefetch route data on hover/touch**: TanStack Router does this by default for `<Link>`s; verify and remove any custom preventDefault.

3. **Cut needless re-renders**:
   - Hoist `useStore.persist.rehydrate()` to `__root.tsx` once instead of in every `PhoneShell`.
   - Replace per-route `motion.h1` mount animation with a single shared layout animation (or drop it).

4. **Make navigation use transitions**: wrap `<Outlet />` with `motion.div` + key=pathname for a 120ms crossfade — feels faster than blank flash.

5. **Trim bundle**: lazy-load `@dnd-kit/*` only on `/checklists/$id` (it’s currently imported eagerly).

## Technical notes

- File edits:
  - `public/manifest.json`, `public/icon-192.png`, `public/icon-512.png`
  - `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/settings.tsx`, `src/routes/absences.tsx`, `src/routes/checklists.index.tsx`, `src/routes/checklists.new.tsx`, `src/routes/checklists.$id.tsx`
  - `src/components/BottomNav.tsx`, `src/components/PhoneShell.tsx`
  - `src/styles.css` (dock blur tokens, content padding)
  - `vite.config.ts` (PWA plugin), `src/start.ts` (SW register guard)
- New deps: `vite-plugin-pwa`, `workbox-window`.
- No backend changes; data stays local in zustand-persist.

## Out of scope

- Real OS widgets (impossible from a PWA).
- Cloud sync / accounts.
- Push notifications / reminders (separate follow-up).
