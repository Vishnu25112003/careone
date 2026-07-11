import { Link } from "react-router-dom";

// Gradient "Our Departments" panel. Home shows six with READ MORE links;
// Services shows all eight without them.
export default function DepartmentsPanel({ items, subtitle, readMore = false }) {
  return (
    <div className="bg-[linear-gradient(140deg,#2AA7A5_0%,#0E7C7B_35%,#14355C_100%)] p-[clamp(26px,4vw,44px)] px-[clamp(20px,3.5vw,40px)] text-white shadow-[0_20px_48px_rgba(14,124,123,0.26)]">
      <h2 className="mb-2 text-center font-display text-[clamp(24px,3.5vw,28px)] font-semibold">
        Our Departments
      </h2>
      {subtitle && (
        <p className="mx-auto mb-8 max-w-[480px] text-center text-sm opacity-[.82]">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-6" />}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-x-10 gap-y-[26px]">
        {items.map((dept) => {
          const Icon = dept.icon;
          return (
            <div key={dept.slug} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-[11px]">
                <Icon className="h-[18px] w-[18px] flex-none" strokeWidth={2} />
                <span className="font-display text-base font-semibold">{dept.name}</span>
              </div>
              <p className="text-[13.5px] leading-[1.6] opacity-80">{dept.short}</p>
              {readMore && (
                <Link
                  to="/services"
                  className="text-[11.5px] font-extrabold tracking-[1.6px] text-teal-pale transition-colors hover:text-white"
                >
                  READ MORE
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
