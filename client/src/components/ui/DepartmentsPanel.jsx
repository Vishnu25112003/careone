import { Link } from "react-router-dom";
import Reveal from "./Reveal";

// Gradient "Our Departments" panel. Home shows six with READ MORE links;
// Services shows all eight without them.
export default function DepartmentsPanel({ items, subtitle, readMore = false }) {
  return (
    <div className="bg-[linear-gradient(140deg,#2AA7A5_0%,#0E7C7B_35%,#14355C_100%)] p-[clamp(26px,4vw,44px)] px-[clamp(20px,3.5vw,40px)] text-white shadow-[0_20px_48px_rgba(14,124,123,0.26)]">
      <Reveal>
        <h2 className="mb-2 text-center font-display text-[clamp(24px,3.5vw,28px)] font-semibold">
          Our Departments
        </h2>
        {subtitle && (
          <p className="mx-auto mb-8 max-w-[480px] text-center text-sm opacity-[.82]">{subtitle}</p>
        )}
        {!subtitle && <div className="mb-6" />}
      </Reveal>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-x-10 gap-y-[26px]">
        {items.map((dept, i) => {
          const Icon = dept.icon;
          return (
            <Reveal
              key={dept.slug}
              delay={(i % 2) * 90 + Math.floor(i / 2) * 60}
              className="group flex flex-col gap-1.5 rounded-xl p-2.5 -m-2.5 transition-colors duration-300 hover:bg-white/[.07]"
            >
              <div className="flex items-center gap-[11px]">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-white/[.12] transition-all duration-300 group-hover:scale-110 group-hover:bg-white/[.22]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <span className="font-display text-base font-semibold">{dept.name}</span>
              </div>
              <p className="text-[13.5px] leading-[1.6] opacity-80">{dept.short}</p>
              {readMore && (
                <Link
                  to="/services"
                  className="w-max text-[11.5px] font-extrabold tracking-[1.6px] text-teal-pale transition-all hover:text-white group-hover:translate-x-1"
                >
                  READ MORE
                </Link>
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
