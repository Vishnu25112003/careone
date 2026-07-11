import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, ListChecks, Images, ArrowRight } from "lucide-react";
import StatCard from "../../components/admin/StatCard";
import RequestRow from "../../components/admin/RequestRow";
import { api } from "../../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats", { auth: true })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of enquiries and gallery.</p>

      {error && (
        <p className="mt-6 rounded-lg bg-maroon/10 px-4 py-3 text-sm font-medium text-maroon">{error}</p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <StatCard label="New Requests" value={stats?.newCount} icon={Inbox} accent="teal" />
        <StatCard label="Total Requests" value={stats?.totalCount} icon={ListChecks} accent="navy" />
        <StatCard label="Gallery Images" value={stats?.galleryCount} icon={Images} accent="gold" />
      </div>

      <div className="mt-8 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-display text-lg font-bold text-navy">Latest Requests</h2>
          <Link
            to="/admin/requests"
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {stats?.latest?.length ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.latest.map((request) => (
                  <RequestRow key={request.id} request={request} readOnly />
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 pb-6 text-sm text-slate-500">
              {stats ? "No requests yet." : "Loading..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
