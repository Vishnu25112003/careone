import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Inbox, Images, LogOut, ExternalLink, HeartPulse } from "lucide-react";
import { clearToken } from "../../lib/auth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/requests", label: "Requests", icon: Inbox },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
];

function NavItems({ onNavigate }) {
  return navItems.map((item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            isActive ? "bg-teal text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </NavLink>
    );
  });
}

export default function AdminLayout() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-soft">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-col bg-navy p-4 md:flex">
        <div className="flex items-center gap-2.5 px-2 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-white">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display font-bold text-white">CareOne</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-gold">
              Admin Panel
            </span>
          </span>
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          <NavItems />
        </nav>
        <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between gap-2 bg-navy px-4 py-3 md:hidden">
          <nav className="flex gap-1 overflow-x-auto">
            <NavItems />
          </nav>
          <button onClick={logout} className="shrink-0 text-white/70 hover:text-white" aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
