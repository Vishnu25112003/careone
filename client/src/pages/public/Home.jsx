import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Stethoscope, Ambulance, HeartPulse } from "lucide-react";
import Container from "../../components/layout/Container";
import DepartmentsPanel from "../../components/ui/DepartmentsPanel";
import AppointmentForm from "../../components/forms/AppointmentForm";
import { site, telHref } from "../../data/site";
import { homeDepartments } from "../../data/services";

const cardCls =
  "rounded-2xl border border-line bg-white p-7 px-[30px] shadow-[0_14px_36px_rgba(20,53,92,0.10)] flex flex-col gap-3.5";

const testimonials = [
  {
    name: "Ramesh K.",
    role: "Elder Care · Pondicherry",
    initial: "R",
    quote:
      "“The nurse who cared for my father treated him like her own family. Medication, hygiene, everything was handled with so much patience. We finally felt we were not alone in this.”",
  },
  {
    name: "Sandhya V.",
    role: "Post Operative Care · Villianur",
    initial: "S",
    quote:
      "“After my mother’s surgery we were worried about wound care at home. CareOne’s team managed dressings, injections and doctor visits perfectly. Her recovery stayed right on track.”",
  },
  {
    name: "Arun M.",
    role: "Bedridden Care · Lawspet",
    initial: "A",
    quote:
      "“They arranged a hospital bed and oxygen concentrator within hours, and the night nurse was always alert. Truly dependable service when our family needed it most.”",
  },
];

const additionalServices = [
  {
    name: "Medical Equipment Rental",
    icon: Stethoscope,
    description:
      "Oxygen concentrators, hospital beds, wheelchairs & suction machines delivered to your home.",
  },
  {
    name: "Ambulance Services",
    icon: Ambulance,
    description: "24/7 ambulance support for emergencies and safe hospital transfers.",
  },
  {
    name: "Palliative Care",
    icon: HeartPulse,
    description: "Comfort-focused care for patients living with serious illness.",
  },
];

export default function Home() {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <>
      {/* Hero with circular photo and gradient rings */}
      <section className="relative overflow-hidden bg-soft">
        <div className="absolute -right-28 -top-48 h-[480px] w-[480px] rounded-full bg-teal-pale/40" />
        <Container className="relative grid grid-cols-[1.1fr_0.9fr] items-center gap-12 pb-[clamp(96px,10vw,130px)] pt-[clamp(48px,7vw,90px)] max-md:grid-cols-1 max-md:gap-10">
          <div className="flex min-w-0 max-w-[520px] flex-col gap-5 max-md:max-w-full">
            <h1 className="font-display text-[clamp(30px,4.5vw,48px)] font-semibold leading-[1.18] text-navy [text-wrap:pretty]">
              The Best Home <span className="text-teal">Nursing Services</span>
            </h1>
            <p className="max-w-[440px] text-[16.5px] leading-[1.7] text-body [text-wrap:pretty]">
              Qualified nurses and trained caregivers bring hospital-grade care into the comfort of
              your home — 24/7 across Pondicherry and surrounding areas.
            </p>
            <div className="mt-1 flex flex-wrap gap-3.5 max-sm:flex-col max-sm:items-stretch max-sm:text-center">
              <Link
                to="/contact"
                className="whitespace-nowrap rounded-full bg-[linear-gradient(90deg,#0E7C7B,#2AA7A5)] px-8 py-[13px] font-display text-[14.5px] font-medium text-white shadow-[0_10px_22px_rgba(14,124,123,0.32)] transition-transform hover:-translate-y-0.5"
              >
                Book a Nurse
              </Link>
              <Link
                to="/services"
                className="whitespace-nowrap rounded-full border-[1.5px] border-[#D7E4EA] bg-white px-8 py-[13px] font-display text-[14.5px] font-medium text-navy transition-colors hover:border-teal hover:text-teal"
              >
                Our Services
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[440px] max-md:max-w-[320px]">
            <div className="absolute -left-7 -top-6 h-[58%] w-[58%] rounded-full bg-[linear-gradient(200deg,#BFE3E2,#7FC9C7)]" />
            <div className="absolute -bottom-6 -right-5 h-[54%] w-[54%] rounded-full bg-[linear-gradient(200deg,#2AA7A5,#0E7C7B)]" />
            <img
              src="/images/hero-home.jpg"
              alt="CareOne nurse caring for a patient at home"
              className="relative h-full w-full rounded-full border-[6px] border-white object-cover shadow-[0_28px_60px_rgba(20,53,92,0.22)]"
            />
          </div>
        </Container>
      </section>

      {/* Hours / Emergency / Appointment overlap cards */}
      <section className="relative z-[5] mx-auto -mt-16 max-w-[1170px] min-[1600px]:max-w-[1380px] px-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(270px,100%),1fr))] gap-[22px]">
          <div className={cardCls}>
            <span className="font-display text-lg font-semibold text-navy">Operating Hours</span>
            <div className="flex flex-col gap-2.5 text-[14.5px]">
              <div className="flex justify-between border-b border-dashed border-line-2 pb-2.5">
                <span className="text-body">Monday — Sunday</span>
                <span className="font-extrabold text-teal">Open 24 Hours</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-line-2 pb-2.5">
                <span className="text-body">Public Holidays</span>
                <span className="font-extrabold text-teal">Open 24 Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body">Response Time</span>
                <span className="font-extrabold text-navy">Within a few hours</span>
              </div>
            </div>
          </div>
          <div className={cardCls}>
            <span className="font-display text-lg font-semibold text-navy">Emergency</span>
            <a
              href={telHref}
              className="flex w-max items-center gap-2.5 rounded-full bg-[linear-gradient(90deg,#0E7C7B,#2AA7A5)] px-[26px] py-[13px] font-display text-[17px] font-semibold text-white shadow-[0_8px_20px_rgba(14,124,123,0.30)] transition-transform hover:-translate-y-0.5"
            >
              <Phone className="h-[17px] w-[17px]" strokeWidth={2.2} />
              +91 {site.phoneDisplay}
            </a>
            <p className="text-sm leading-[1.65] text-body">
              Need a nurse, ambulance or medical equipment urgently? Call us any time — day or
              night — and our care team will respond immediately.
            </p>
          </div>
        </div>

        <div className={`${cardCls} mt-[22px] gap-4`}>
          <span className="font-display text-lg font-semibold text-navy">Make an Appointment</span>
          <AppointmentForm />
        </div>
      </section>

      {/* Our Departments */}
      <section className="mx-auto max-w-[980px] min-[1600px]:max-w-[1150px] px-6 pt-[clamp(56px,7vw,88px)]">
        <DepartmentsPanel
          items={homeDepartments}
          subtitle="Specialised home nursing care delivered by qualified, verified professionals."
          readMore
        />
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden">
        <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-14 py-[clamp(56px,8vw,96px)] max-sm:gap-10">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[clamp(26px,4.5vw,34px)] font-semibold text-navy">
              Patient's Testimonials
            </h2>
            <div className="flex flex-col gap-4 rounded-[18px] border border-line bg-white p-8 px-[34px] shadow-[0_16px_40px_rgba(20,53,92,0.10)] max-sm:p-6">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#BFE3E2" aria-hidden="true">
                <path d="M11 7H7a4 4 0 0 0-4 4v6h6v-6H6a2 2 0 0 1 2-2h3zm10 0h-4a4 4 0 0 0-4 4v6h6v-6h-3a2 2 0 0 1 2-2h3z" />
              </svg>
              <p className="text-[15.5px] leading-[1.75] text-body">{t.quote}</p>
              <div className="flex items-center justify-between gap-3.5">
                <div className="flex flex-col leading-[1.3]">
                  <span className="font-display text-[15px] font-semibold text-navy">{t.name}</span>
                  <span className="text-[12.5px] text-muted">{t.role}</span>
                </div>
                <div className="flex gap-2">
                  {testimonials.map((item, i) => (
                    <button
                      key={item.initial}
                      onClick={() => setActive(i)}
                      aria-label={`Show testimonial from ${item.name}`}
                      className={`flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[#D7E4EA] font-display text-[13px] font-bold ${
                        i === active ? "bg-teal text-white" : "bg-white text-teal"
                      }`}
                    >
                      {item.initial}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -bottom-[46px] -right-[46px] h-[300px] w-[300px] rounded-full bg-[linear-gradient(200deg,#2AA7A5,#0E7C7B)] opacity-[.16]" />
            <div className="relative h-[400px] w-full overflow-hidden rounded-[24px_130px_24px_24px] shadow-[0_22px_48px_rgba(20,53,92,0.16)] max-sm:h-[280px] max-sm:rounded-[20px_80px_20px_20px]">
              <img
                src="/images/testimonial-home.avif"
                alt="A caring moment between a CareOne nurse and patient"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Additional services */}
      <section className="bg-soft py-[clamp(56px,7vw,80px)]">
        <Container>
          <h2 className="mb-2 text-center font-display text-[clamp(26px,4vw,32px)] font-semibold text-navy">
            Additional Services
          </h2>
          <p className="mx-auto mb-10 max-w-[520px] text-center text-[15px] text-body">
            Beyond nursing — everything a home patient needs.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-[22px]">
            {additionalServices.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex flex-col gap-[11px] rounded-2xl border border-line bg-white p-[30px] px-7 shadow-[0_10px_26px_rgba(20,53,92,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,53,92,0.12)]"
                >
                  <span className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-mint text-teal">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <span className="font-display text-[17px] font-semibold text-navy">
                    {item.name}
                  </span>
                  <span className="text-sm leading-[1.6] text-body">{item.description}</span>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
