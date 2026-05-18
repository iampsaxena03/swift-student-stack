import { useState } from "react";
import { Drawer } from "vaul";
import { useStore, SUBJECTS, logicalToday, upcomingSunday, type Subject, type HomeworkKind } from "@/lib/store";
import { toast } from "sonner";
import { ChevronLeft, X } from "lucide-react";

export function AddHomeworkSheet({
  open,
  onOpenChange,
  defaultKind = "today",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultKind?: HomeworkKind;
}) {
  const upsertHomework = useStore((s) => s.upsertHomework);
  const resetTime = useStore((s) => s.settings.dailyResetTime);

  const [kind, setKind] = useState<HomeworkKind>(defaultKind);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [dpp, setDpp] = useState("");
  const [modules, setModules] = useState("");
  const [others, setOthers] = useState("");

  const reset = () => {
    setSubject(null);
    setDpp("");
    setModules("");
    setOthers("");
    setKind(defaultKind);
  };

  const close = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const save = () => {
    if (!subject) return;
    const hasAny = [dpp, modules, others].some((v) => v.trim().length > 0);
    if (!hasAny) {
      toast("Add at least one field");
      return;
    }
    const date = kind === "today" ? logicalToday(new Date(), resetTime) : todayStr();
    upsertHomework({
      kind,
      subject,
      date,
      dpp: dpp.trim() || undefined,
      modules: modules.trim() || undefined,
      others: others.trim() || undefined,
      weekendEndDate: kind === "weekend" ? upcomingSunday(date) : undefined,
    });
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    toast("Homework saved");
    close(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={close}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-h-[90vh] max-w-[440px] flex-col rounded-t-3xl bg-[oklch(0.16_0.005_270)] outline-none">
          <Drawer.Title className="sr-only">Add homework</Drawer.Title>
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/15" />
          <div className="flex items-center justify-between px-5 pt-3">
            <div className="flex items-center gap-2">
              {subject && (
                <button
                  onClick={() => setSubject(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
                  aria-label="Back"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <p className="text-on-surface text-base font-semibold">
                {subject ? SUBJECTS.find((s) => s.key === subject)?.label : "Add homework"}
              </p>
            </div>
            <button
              onClick={() => close(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Kind toggle */}
          <div className="mx-5 mt-4 flex rounded-full bg-white/5 p-1">
            {(["today", "weekend"] as HomeworkKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`flex-1 rounded-full py-2 text-xs font-semibold capitalize transition ${
                  kind === k ? "bg-white text-ink" : "text-on-surface-muted"
                }`}
              >
                {k === "today" ? "Today" : "Weekend"}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto px-5 pb-8 pt-5">
            {!subject ? (
              <div className="grid grid-cols-1 gap-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSubject(s.key)}
                    className="flex items-center gap-4 rounded-2xl p-4 text-left active:scale-[0.98]"
                    style={{ background: s.color, color: "oklch(0.16 0.005 270)" }}
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-lg font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="DPP" value={dpp} onChange={setDpp} placeholder="e.g. DPP 1, 2, 3" />
                <Field label="Modules" value={modules} onChange={setModules} placeholder="e.g. Module 4 Q.1-15" />
                <Field label="Others" value={others} onChange={setOthers} placeholder="e.g. Revise notes" />
                <button
                  onClick={save}
                  className="mt-2 w-full rounded-2xl bg-white py-4 text-base font-semibold text-ink active:scale-[0.98]"
                >
                  Save homework
                </button>
              </div>
            )}
          </div>
          <div style={{ height: "env(safe-area-inset-bottom)" }} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-on-surface-muted text-[11px] font-semibold uppercase tracking-wider">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="text-on-surface mt-1.5 block w-full resize-none rounded-2xl bg-white/5 px-4 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-white/30"
      />
    </label>
  );
}

function todayStr() {
  const d = new Date();
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
