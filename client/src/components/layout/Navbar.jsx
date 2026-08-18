import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Phone, Menu } from "lucide-react";
import Logo from "../ui/Logo";
import { site } from "../../data/site";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About us" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const linkCls = (isActive) => (isActive ? "text-teal" : "text-ink hover:text-teal");

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/[.97] shadow-[0_1px_10px_rgba(20,51,102,0.07)] backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1170px] min-[1600px]:max-w-[1380px] items-center justify-between gap-5 px-6 py-3.5">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-[30px] font-display text-sm font-medium nav:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `py-1 transition-colors ${linkCls(isActive)}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[linear-gradient(90deg,#1B74B7,#3FA0D8)] px-[22px] py-[11px] font-display text-[13.5px] font-medium text-white shadow-[0_6px_16px_rgba(27,116,183,0.30)] transition-transform hover:-translate-y-px"
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span className="max-[479px]:hidden">{site.phoneDisplay}</span>
          </Link>
          <button
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border-[1.5px] border-[#D7E4EA] bg-white text-navy nav:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-0.5 border-t border-line bg-white px-6 pb-[18px] pt-2.5 font-display text-[15px] font-medium shadow-[0_14px_28px_rgba(20,51,102,0.10)] nav:hidden">
          {links.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-1 py-3 ${i < links.length - 1 ? "border-b border-[#F0F4F9]" : ""} ${linkCls(isActive)}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
