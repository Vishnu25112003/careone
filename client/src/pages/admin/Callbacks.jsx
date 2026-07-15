import { useCallback, useEffect, useState } from "react";
import { Phone, PhoneCall, Trash2, Clock } from "lucide-react";
import StatusChip from "../../components/admin/StatusChip";
import WhatsAppIcon from "../../components/ui/WhatsAppIcon";
import { api } from "../../lib/api";

const TABS = [
  { key: "", label: "All" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CLOSED", label: "Closed" },
];

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

// Direct contact support card: the phone number is the hero, with one-tap
// Call / WhatsApp actions — these visitors gave us nothing but a number.
function CallbackCard({ request, onStatusChange, onDelete }) {
  const waText =
    "Hello, this is CareOne Nursing Services. You requested a callback on our website — how can we help you?";
  const waLink = `https://wa.me/91${request.phone}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
            <PhoneCall className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <a
              href={`tel:+91${request.phone}`}
              className="block font-display text-lg font-bold tracking-wide text-navy hover:text-teal"
            >
              +91 {request.phone}
            </a>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {formatDate(request.createdAt)}
            </span>
          </div>
        </div>
        <StatusChip status={request.status} />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={`tel:+91${request.phone}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-dark"
        >
          <Phone className="h-3.5 w-3.5" />
          Call Now
        </a>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1ebe5b]"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <select
          value={request.status}
          onChange={(e) => onStatusChange(request.id, e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-navy outline-none focus:border-teal"
          aria-label={`Status for ${request.phone}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => onDelete(request.id)}
          title="Delete callback request"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon/10 text-maroon transition hover:bg-maroon hover:text-white"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Callbacks() {
  const [callbacks, setCallbacks] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/admin/callbacks${status ? `?status=${status}` : ""}`, { auth: true });
      setCallbacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function handleStatusChange(id, status) {
    try {
      const updated = await api.patch(`/admin/requests/${id}`, { status }, { auth: true });
      setCallbacks((rows) =>
        filter && updated.status !== filter
          ? rows.filter((r) => r.id !== id)
          : rows.map((r) => (r.id === id ? updated : r))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const target = callbacks.find((r) => r.id === id);
    if (!window.confirm(`Delete the callback request from ${target?.phone}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/requests/${id}`, { auth: true });
      setCallbacks((rows) => rows.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Callback Requests</h1>
      <p className="mt-1 text-sm text-slate-500">
        Quick callbacks from the "Need care at home? We're one call away" section — call or
        WhatsApp them directly.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              filter === tab.key ? "bg-teal text-white" : "bg-white text-navy ring-1 ring-slate-200 hover:bg-teal/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-maroon/10 px-4 py-3 text-sm font-medium text-maroon">{error}</p>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-slate-500 ring-1 ring-slate-100">
            Loading callback requests...
          </p>
        ) : callbacks.length === 0 ? (
          <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-slate-500 ring-1 ring-slate-100">
            No {filter ? filter.toLowerCase() : ""} callback requests found.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-5">
            {callbacks.map((request) => (
              <CallbackCard
                key={request.id}
                request={request}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
