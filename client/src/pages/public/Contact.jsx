import { Phone } from "lucide-react";
import Container from "../../components/layout/Container";
import PageBanner from "../../components/ui/PageBanner";
import EnquiryForm from "../../components/forms/EnquiryForm";
import { site, telHref, waHref } from "../../data/site";

const cardCls =
  "flex flex-col gap-3.5 rounded-2xl border border-line bg-white p-[30px] px-7 shadow-[0_10px_26px_rgba(20,53,92,0.07)]";

export default function Contact() {
  return (
    <>
      <PageBanner title="Contact" image="/images/hero-contact.jpg" imageAlt="Contact CareOne" />

      {/* Info cards */}
      <section className="mx-auto max-w-[1170px] min-[1600px]:max-w-[1380px] px-6 pt-[clamp(40px,5vw,64px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-[22px]">
          <div className={cardCls}>
            <span className="font-display text-[17px] font-semibold text-navy">Contact Info</span>
            <div className="flex flex-col gap-2.5 text-sm leading-[1.6]">
              <div>
                <span className="font-extrabold text-ink">Address:</span>
                <br />
                <span className="text-body">{site.area}</span>
              </div>
              <div>
                <span className="font-extrabold text-ink">Phone:</span>
                <br />
                <a href={telHref} className="font-bold text-teal">
                  +91 {site.phoneDisplay}
                </a>
              </div>
              <div>
                <span className="font-extrabold text-ink">WhatsApp:</span>
                <br />
                <a
                  href={waHref("Hello CareOne, I need home nursing assistance.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-teal"
                >
                  Chat with us
                </a>
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <span className="font-display text-[17px] font-semibold text-navy">
              Operating Hours
            </span>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between border-b border-dashed border-line-2 pb-[9px]">
                <span className="text-body">Mon — Sun</span>
                <span className="font-extrabold text-teal">24 Hours</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-line-2 pb-[9px]">
                <span className="text-body">Holidays</span>
                <span className="font-extrabold text-teal">24 Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body">All days of the year</span>
                <span className="font-extrabold text-navy">Always open</span>
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <span className="font-display text-[17px] font-semibold text-navy">Emergency</span>
            <a
              href={telHref}
              className="flex w-max items-center gap-[9px] rounded-full bg-[linear-gradient(90deg,#0E7C7B,#2AA7A5)] px-[22px] py-3 font-display text-[15.5px] font-semibold text-white shadow-[0_8px_18px_rgba(14,124,123,0.28)] transition-transform hover:-translate-y-px"
            >
              <Phone className="h-[15px] w-[15px]" strokeWidth={2.2} />
              +91 {site.phoneDisplay}
            </a>
            <p className="text-[13.5px] leading-[1.65] text-body">
              For urgent nursing, ambulance or equipment needs — call any time, day or night.
            </p>
          </div>
        </div>
      </section>

      {/* Get in touch */}
      <Container className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-14 pb-[clamp(48px,6vw,80px)] pt-[clamp(40px,5vw,64px)] max-sm:gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[clamp(24px,4vw,30px)] font-semibold text-navy">
            Get in Touch
          </h2>
          <p className="text-[15px] leading-[1.75] text-body">
            Tell us what you need and our care team will call you back to plan the right care for
            your loved one. No obligation — just honest guidance.
          </p>
          <div className="mt-2 h-[300px] w-full overflow-hidden rounded-2xl shadow-[0_14px_34px_rgba(20,53,92,0.10)] max-sm:h-[220px]">
            <img
              src="/images/get-in-touch.jpg"
              alt={`CareOne — serving ${site.area}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <EnquiryForm />
      </Container>
    </>
  );
}
