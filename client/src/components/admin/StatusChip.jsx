const styles = {
  NEW: "bg-teal/10 text-teal",
  CONTACTED: "bg-gold/20 text-[#8a6d2a]",
  CLOSED: "bg-slate-100 text-slate-500",
};

export default function StatusChip({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.NEW}`}>
      {status}
    </span>
  );
}
