import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, ListChecks, Settings, Plus } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/absences", label: "Absences", icon: CalendarDays },
  { to: "/checklists", label: "Lists", icon: ListChecks },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex w-full max-w-[420px] items-center gap-1 rounded-[28px] border border-white/10 bg-[oklch(0.2_0.005_270/0.85)] p-1.5 shadow-[0_20px_60px_-10px_oklch(0_0_0/0.6)] backdrop-blur-xl">
        {tabs.slice(0, 2).map((t) => (
          <TabBtn key={t.to} {...t} active={t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to)} />
        ))}
        <Link
          to="/checklists/new"
          aria-label="New checklist"
          className="mx-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_20px_-4px_oklch(0_0_0/0.5)] active:scale-90"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        {tabs.slice(2).map((t) => (
          <TabBtn key={t.to} {...t} active={t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to)} />
        ))}
      </div>
    </nav>
  );
}

function TabBtn({ to, label, icon: Icon, active }: { to: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link
      to={to as any}
      preload="intent"
      className={`flex h-12 flex-1 items-center justify-center rounded-2xl transition active:scale-95 ${
        active ? "bg-white text-ink" : "text-white/60"
      }`}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
}
