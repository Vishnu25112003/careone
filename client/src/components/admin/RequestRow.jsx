import { Trash2 } from "lucide-react";
import StatusChip from "./StatusChip";
import WhatsAppIcon from "../ui/WhatsAppIcon";

const STATUSES = ["NEW", "CONTACTED", "CLOSED"];

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RequestRow({ request, readOnly = false, onStatusChange, onDelete }) {
  const waText = `Hello ${request.name}, this is CareOne Nursing Services regarding your ${request.service} request.`;
  const waLink = `https://wa.me/91${request.phone}?text=${encodeURIComponent(waText)}`;

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-soft/60">
      <td className="px-4 py-3 text-sm font-semibold text-navy">{request.name}</td>
      <td className="px-4 py-3 text-sm">
        <a href={`tel:+91${request.phone}`} className="text-teal hover:underline">
          {request.phone}
        </a>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{request.service}</td>
      <td className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-500" title={request.message || ""}>
        {request.message || "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{formatDate(request.createdAt)}</td>
      <td className="px-4 py-3">
        {readOnly ? (
          <StatusChip status={request.status} />
        ) : (
          <select
            value={request.status}
            onChange={(e) => onStatusChange(request.id, e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-navy outline-none focus:border-teal"
            aria-label={`Status for ${request.name}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </td>
      {!readOnly && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              title="Reply on WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-[#1ebe5b]"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <button
              onClick={() => onDelete(request.id)}
              title="Delete request"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon/10 text-maroon transition hover:bg-maroon hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
