import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import { site, telHref, waHref } from "../../data/site";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About us" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-footer">
      <div className="mx-auto grid max-w-[1170px] min-[1600px]:max-w-[1380px] grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-12 px-6 pb-10 pt-16">
        <div className="flex flex-col gap-4">
          <Logo markSize={44} wordSize={19} tagSize={9} />
          <p className="max-w-[320px] text-sm leading-[1.7] text-body">
            {site.tagline} Home nursing you can trust, 24/7 across Pondicherry.
          </p>
          <span className="text-[12.5px] text-[#9AA7BC]">
            © 2026 CareOne Nursing Services. All Rights Reserved.
          </span>
        </div>

        <div className="flex flex-col gap-[13px] text-sm">
          <span className="mb-1 font-display text-base font-semibold text-navy">Contact</span>
          <div className="leading-[1.6]">
            <span className="font-extrabold text-ink">Address:</span>{" "}
            <span className="text-body">{site.area}</span>
          </div>
          <div>
            <span className="font-extrabold text-ink">Phone:</span>{" "}
            <a href={telHref} className="font-bold text-teal hover:text-navy">
              +91 {site.phoneDisplay}
            </a>
          </div>
          <div>
            <span className="font-extrabold text-ink">WhatsApp:</span>{" "}
            <a
              href={waHref("Hello CareOne, I would like to know more about your services.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal hover:text-navy"
            >
              Chat with us
            </a>
          </div>
          <div>
            <span className="font-extrabold text-ink">Hours:</span>{" "}
            <span className="text-body">Open 24/7 — All Days</span>
          </div>
        </div>

        <div className="flex flex-col gap-[13px]">
          <span className="mb-1 font-display text-base font-semibold text-navy">Useful Links</span>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-body transition-colors hover:text-teal"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
