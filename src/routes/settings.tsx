import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Smartphone, Trash2, Info, Pin } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const absences = useStore((s) => s.absences);
  const checklists = useStore((s) => s.checklists);

  const clearAll = () => {
    if (!confirm("Erase ALL absences and checklists? This cannot be undone.")) return;
    localStorage.removeItem("student-survival-v1");
    location.reload();
  };

  return (
    <PhoneShell>
      <div className="px-6 pt-12">
        <p className="text-on-surface-muted text-sm">Pocket</p>
        <h1 className="text-on-surface mt-1 text-3xl font-semibold tracking-tight">Settings</h1>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[oklch(0.22_0.005_270)] p-4">
            <p className="text-on-surface-muted text-xs">Absences</p>
            <p className="text-on-surface mt-2 text-2xl font-semibold">{absences.length}</p>
          </div>
          <div className="rounded-2xl bg-[oklch(0.22_0.005_270)] p-4">
            <p className="text-on-surface-muted text-xs">Checklists</p>
            <p className="text-on-surface mt-2 text-2xl font-semibold">{checklists.length}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-[oklch(0.22_0.005_270)]">
          <Row
            icon={<Smartphone className="h-5 w-5" />}
            title="Add to home screen"
            sub="iOS Safari: Share → Add to Home Screen. Android Chrome: ⋮ → Install app."
            onClick={() =>
              toast("Open in your browser", {
                description: "Use the browser menu to add this app to your home screen.",
              })
            }
          />
          <Row
            icon={<Pin className="h-5 w-5" />}
            title="Pinned shortcuts"
            sub="Pin a checklist to make it appear on your home screen for one-tap access."
            border
          />
          <Row
            icon={<Info className="h-5 w-5" />}
            title="About Pocket"
            sub="Built for students. All your data stays on this device."
            border
          />
          <Row
            icon={<Trash2 className="h-5 w-5" />}
            title="Erase all data"
            sub="Delete every absence and checklist."
            danger
            border
            onClick={clearAll}
          />
        </div>

        <p className="text-on-surface-muted mt-8 text-center text-xs">
          Made with care · v1.0
        </p>
      </div>
    </PhoneShell>
  );
}

function Row({
  icon,
  title,
  sub,
  border,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  border?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 px-4 py-4 text-left active:bg-white/5 ${
        border ? "border-t border-white/5" : ""
      }`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          danger ? "bg-[oklch(0.55_0.18_25)] text-white" : "bg-white/10 text-on-surface"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${danger ? "text-[oklch(0.78_0.16_25)]" : "text-on-surface"}`}>
          {title}
        </p>
        <p className="text-on-surface-muted mt-0.5 text-xs leading-relaxed">{sub}</p>
      </div>
    </button>
  );
}