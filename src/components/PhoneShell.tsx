import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { BottomNav } from "./BottomNav";

export function PhoneShell({ children, hideNav }: { children: React.ReactNode; hideNav?: boolean }) {
  const setHydrated = useStore((s) => s.setHydrated);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      // Manually rehydrate (skipHydration: true)
      useStore.persist.rehydrate()?.then(() => setHydrated());
    }
  }, [hydrated, setHydrated]);

  return (
    <div className="phone-shell flex flex-col">
      <div className="flex-1 pb-28">{children}</div>
      {!hideNav && <BottomNav />}
    </div>
  );
}