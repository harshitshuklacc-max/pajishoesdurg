import type { StoreSettings } from "@/lib/settings";

export function AnnouncementBar({ settings }: { settings: StoreSettings }) {
  const shipping =
    settings.freeShippingAbove > 0
      ? `Free shipping on orders above ₹${settings.freeShippingAbove}`
      : "All over India shipping available";

  return (
    <div className="bg-paji-deep text-center text-[11px] font-medium tracking-wide text-white/95 sm:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5">
        <span aria-hidden>🇮🇳</span>
        <span className="uppercase tracking-[0.12em]">{shipping}</span>
      </div>
    </div>
  );
}
