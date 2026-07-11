// CareOne logo lockup: mark + stacked wordmark, sized per context.
export default function Logo({ markSize = 46, wordSize = 21, tagSize = 9.5, className = "" }) {
  return (
    <span className={`flex items-center gap-[11px] ${className}`}>
      <img
        src="/logo-mark.png"
        alt="CareOne logo"
        style={{ width: markSize, height: markSize }}
        className="object-contain"
      />
      <span className="flex flex-col leading-[1.05]">
        <span className="font-display font-bold text-navy" style={{ fontSize: wordSize }}>
          Care<span className="text-teal">One</span>
        </span>
        <span
          className="font-extrabold tracking-[2.4px] text-muted"
          style={{ fontSize: tagSize }}
        >
          NURSING SERVICES
        </span>
      </span>
    </span>
  );
}
