import { useState } from "react";
import { ShieldCheck, HousePlus } from "lucide-react";
import Container from "../../components/layout/Container";
import PageBanner from "../../components/ui/PageBanner";
import Button from "../../components/ui/Button";
import ImagePlaceholder from "../../components/ui/ImagePlaceholder";
import Reveal from "../../components/ui/Reveal";

const faqs = [
  {
    q: "Do you provide nurses 24 hours a day?",
    a: "Yes. CareOne operates 24/7, all days of the year — including holidays. You can choose 12-hour shifts, 24-hour live-in care, or visit-based care, and we also respond to urgent same-day requests across Pondicherry and surrounding areas.",
  },
  {
    q: "Are your nurses qualified and verified?",
    a: "Every nurse and caregiver is qualified, experienced and background-verified before entering your home. For specialised care like tracheostomy or post-operative support, we assign nurses trained in those exact procedures.",
  },
  {
    q: "How quickly can a nurse reach our home?",
    a: "In most cases we respond within a few hours. Call or WhatsApp us on 88385 62250, tell us the patient's condition, and our care team will arrange the right nurse — along with any equipment like hospital beds or oxygen concentrators.",
  },
  {
    q: "What does home nursing cost?",
    a: "Pricing depends on the type of care, shift length and duration. We keep it honest and transparent — call us for a free assessment and we'll suggest a care plan that fits both the patient's needs and your budget.",
  },
];

const pillars = [
  {
    label: "Professional",
    icon: ShieldCheck,
    text: "Every nurse is qualified, experienced and background-verified before entering your home.",
  },
  {
    label: "Quality",
    icon: HousePlus,
    text: "Hospital-grade protocols, strict hygiene and personalised care plans for every patient.",
  },
];

const team = [
  { name: "Team Member", role: "Senior Nurse" },
  { name: "Team Member", role: "Staff Nurse" },
  { name: "Team Member", role: "Caregiver" },
  { name: "Team Member", role: "Physiotherapist" },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <PageBanner title="About us" image="/images/hero-about.jpg" imageAlt="CareOne care team" />

      {/* History */}
      <section className="mx-auto max-w-[1170px] min-[1600px]:max-w-[1380px] px-6 pb-[clamp(40px,5vw,64px)] pt-[clamp(40px,5vw,64px)]">
        <h2 className="mb-[18px] font-display text-[clamp(26px,4vw,32px)] font-semibold text-navy">
          CareOne History
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-10">
          <p className="text-[15.5px] leading-[1.8] text-body">
            CareOne Nursing Services is a home-based healthcare company serving Pondicherry and
            surrounding areas, available 24 hours a day, 7 days a week. We bring qualified nurses,
            trained caregivers and hospital-grade care standards into your home.
          </p>
          <p className="text-[15.5px] leading-[1.8] text-body">
            Our mission is simple: no family should have to choose between quality care and the
            comfort of home. Whether it is an elderly parent, a loved one recovering from surgery,
            or a patient needing specialised long-term support — we are there, whenever you need
            us.
          </p>
        </div>
        <Button to="/contact" className="mt-7">
          Book a Nurse
        </Button>
      </section>

      {/* FAQ dark band */}
      <section className="relative overflow-hidden bg-navy-deep py-[clamp(56px,7vw,88px)] text-white">
        {/* Background photo (drop the file at client/public/images/faq-bg.jpg); hidden if absent */}
        <img
          src="/images/faq-bg.jpg"
          alt=""
          aria-hidden="true"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(20,51,102,0.92),rgba(14,38,81,0.88))]" />
        <Container className="relative">
          <Reveal>
            <h2 className="mb-10 font-display text-[clamp(26px,4.5vw,34px)] font-semibold max-sm:mb-7">
              Faq &amp; Stuff
            </h2>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-14 max-sm:gap-10">
            <div className="flex flex-col gap-4">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 90} className="flex flex-col">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    aria-expanded={openFaq === i}
                    className="flex cursor-pointer items-center justify-between gap-3.5 rounded bg-[linear-gradient(90deg,#1B74B7,#3FA0D8)] px-[22px] py-4 text-left transition-[filter] hover:brightness-[1.08]"
                  >
                    <span className="font-display text-[15.5px] font-medium text-white">
                      {faq.q}
                    </span>
                    <span
                      className={`font-display text-lg font-bold text-white transition-transform duration-300 ${
                        openFaq === i ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-1 pb-1.5 pt-[18px] text-[14.5px] leading-[1.8] text-[#C7D3E4]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-[22px] max-sm:grid-cols-1">
              {pillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <Reveal
                    key={pillar.label}
                    delay={150 + i * 130}
                    className="relative mt-[22px] flex flex-col items-center gap-[18px] rounded-[14px] border-[1.5px] border-white/85 px-[22px] pb-[30px] pt-11 text-center transition-colors duration-300 hover:bg-white/[.06]"
                  >
                    <span className="absolute -top-[22px] left-[18px] bg-white px-[18px] py-2 font-display text-[17px] font-semibold text-navy">
                      {pillar.label}
                    </span>
                    <Icon className="h-[46px] w-[46px] text-white" strokeWidth={1.4} />
                    <p className="text-[13.5px] leading-[1.8] text-[#C7D3E4]">{pillar.text}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Care team */}
      <section className="mx-auto max-w-[1170px] min-[1600px]:max-w-[1380px] px-6 py-[clamp(48px,6vw,72px)]">
        <h2 className="mb-9 text-center font-display text-[clamp(26px,4vw,32px)] font-semibold text-navy max-sm:mb-7">
          The Care Team
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-[22px]">
          {team.map((member) => (
            <div key={member.role} className="flex flex-col items-center gap-3">
              <div className="h-[260px] w-full overflow-hidden rounded-2xl bg-field shadow-[0_10px_26px_rgba(20,51,102,0.08)]">
                <ImagePlaceholder />
              </div>
              <span className="font-display text-[15.5px] font-semibold text-navy">
                {member.name}
              </span>
              <span className="-mt-2 text-[13px] text-muted">{member.role}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
