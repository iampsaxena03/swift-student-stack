import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, ListChecks, Settings } from "lucide-react";

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
      className="absolute bottom-0 left-0 right-0 z-40 px-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around rounded-full bg-[oklch(0.22_0.005_270)] px-3 py-2 shadow-[0_10px_40px_-10px_oklch(0_0_0_/_0.6)] backdrop-blur">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.exact
            ? location.pathname === t.to
            : location.pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex h-12 min-w-12 items-center justify-center rounded-full px-4 transition-all active:scale-95 ${
                active ? "bg-white text-[oklch(0.16_0.005_270)]" : "text-white/60"
              }`}
            >
              <Icon className="h-5 w-5" />
              {active && <span className="ml-2 text-sm font-semibold">{t.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}