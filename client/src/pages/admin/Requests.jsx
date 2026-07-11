import { useCallback, useEffect, useState } from "react";
import RequestRow from "../../components/admin/RequestRow";
import { api } from "../../lib/api";

const TABS = [
  { key: "", label: "All" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "CLOSED", label: "Closed" },
];

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (status) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/admin/requests${status ? `?status=${status}` : ""}`, { auth: true });
      setRequests(data);
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
      setRequests((rows) =>
        filter && updated.status !== filter
          ? rows.filter((r) => r.id !== id)
          : rows.map((r) => (r.id === id ? updated : r))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const target = requests.find((r) => r.id === id);
    if (!window.confirm(`Delete the request from "${target?.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/requests/${id}`, { auth: true });
      setRequests((rows) => rows.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Requests</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage customer enquiries — update status or reply on WhatsApp.
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

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No {filter ? filter.toLowerCase() : ""} requests found.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
