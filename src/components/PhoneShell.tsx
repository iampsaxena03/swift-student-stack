import { BottomNav } from "./BottomNav";

export function PhoneShell({ children, hideNav }: { children: React.ReactNode; hideNav?: boolean }) {
  return (
    <div className="phone-shell flex flex-col">
      <div className="flex-1 pb-32">{children}</div>
      {!hideNav && <BottomNav />}
    </div>
  );
}