import { useState } from "react";
import PageBanner from "../../components/ui/PageBanner";
import Button from "../../components/ui/Button";
import DepartmentsPanel from "../../components/ui/DepartmentsPanel";
import { departments } from "../../data/services";

export default function Services() {
  const [tab, setTab] = useState(0);
  const active = departments[tab];

  return (
    <>
      <PageBanner title="Services" image="/images/hero-services.jpg" imageAlt="Home nursing services" />

      {/* Intro */}
      <section className="mx-auto max-w-[1170px] min-[1600px]:max-w-[1380px] px-6 pb-[clamp(40px,5vw,64px)] pt-[clamp(40px,5vw,64px)] text-center">
        <h2 className="mb-[18px] font-display text-[clamp(26px,4vw,32px)] font-semibold text-navy">
          Only Top Quality Care
        </h2>
        <div className="mx-auto grid max-w-[980px] min-[1600px]:max-w-[1150px] grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-10 text-left">
          <p className="text-[15.5px] leading-[1.8] text-body">
            Every CareOne nurse is qualified, experienced and background-verified. We follow
            hospital-grade hygiene and safety protocols on every visit, and build a personalised
            care plan around each patient's condition and routine.
          </p>
          <p className="text-[15.5px] leading-[1.8] text-body">
            From daily elder care to ICU-standard tracheostomy support, our team brings the right
            skills to your home — with honest pricing and dependable, consistent service, 24 hours
            a day.
          </p>
        </div>
        <Button to="/contact" className="mt-8">
          Book a Nurse
        </Button>
      </section>

      {/* Departments */}
      <section className="mx-auto max-w-[980px] min-[1600px]:max-w-[1150px] px-6 pb-[clamp(40px,5vw,64px)]">
        <DepartmentsPanel items={departments} />
      </section>

      {/* Service detail with scrolling tabs */}
      <section className="mx-auto max-w-[1170px] min-[1600px]:max-w-[1380px] px-6 pb-[clamp(48px,6vw,80px)]">
        <div className="flex gap-2.5 overflow-x-auto pb-2.5 [scrollbar-width:thin]">
          {departments.map((dept, i) => (
            <button
              key={dept.slug}
              onClick={() => setTab(i)}
              className={`flex-none cursor-pointer whitespace-nowrap border border-line-2 px-6 py-[13px] font-display text-sm font-medium transition-colors hover:border-teal ${
                i === tab
                  ? "bg-[linear-gradient(90deg,#0E7C7B,#2AA7A5)] text-white"
                  : "bg-field text-ink"
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
        <div className="mt-[34px] grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-11">
          <div className="h-[280px] w-full overflow-hidden shadow-[0_14px_34px_rgba(20,53,92,0.12)]">
            <img src={active.image} alt={active.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-3.5">
            <h3 className="font-display text-[22px] font-semibold text-navy">{active.name}</h3>
            <p className="text-[15px] leading-[1.85] text-body">{active.long}</p>
            <span className="text-sm font-extrabold text-teal">{active.points}</span>
          </div>
        </div>
      </section>
    </>
  );
}
