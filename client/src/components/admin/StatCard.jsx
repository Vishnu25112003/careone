const accents = {
  teal: "bg-teal/10 text-teal",
  navy: "bg-navy/10 text-navy",
  gold: "bg-gold/15 text-gold",
};

export default function StatCard({ label, value, icon: Icon, accent = "teal" }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${accents[accent]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-display text-3xl font-bold text-navy">{value ?? "—"}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
