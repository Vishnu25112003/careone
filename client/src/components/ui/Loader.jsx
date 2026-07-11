import { useEffect, useState } from "react";

// Branded loading screen shown briefly on first load, per the v2 design.
export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-[22px] bg-white">
      <img
        src="/logo-mark.png"
        alt="CareOne"
        className="h-[88px] w-[88px] object-contain [animation:co-loader-pulse_1.2s_ease-in-out_infinite]"
      />
      <div className="flex flex-col items-center gap-1 leading-[1.1]">
        <span className="font-display text-2xl font-bold text-navy">
          Care<span className="text-teal">One</span>
        </span>
        <span className="text-[10px] font-extrabold tracking-[2.6px] text-muted">
          NURSING SERVICES
        </span>
      </div>
      <div className="h-[3px] w-[140px] overflow-hidden rounded-full bg-line-2">
        <div className="h-full w-1/3 bg-[linear-gradient(90deg,#0E7C7B,#2AA7A5)] [animation:co-loader-bar_1.1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
