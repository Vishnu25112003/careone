import { useState } from "react";
import { api } from "../../lib/api";

// "One call away" band shown above the footer on every public page.
// Captures a phone number and files it as an enquiry for the admin panel.
export default function CallbackBand() {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const value = phone.trim();
    if (!/^[6-9]\d{9}$/.test(value)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/requests", {
        name: "Quick callback request",
        phone: value,
        service: "Not sure — need guidance",
        message: "Requested a callback from the website banner.",
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(110deg,#14355C_0%,#0E7C7B_100%)] text-white">
      <div className="absolute -right-[100px] -top-[120px] h-[420px] w-[420px] rounded-full bg-white/[.06]" />
      <div className="relative mx-auto flex max-w-[1170px] min-[1600px]:max-w-[1380px] flex-col items-center gap-5 px-6 py-[clamp(48px,6vw,64px)] text-center">
        <span className="font-display text-[clamp(20px,4vw,26px)] font-semibold">
          Need care at home? We're one call away.
        </span>
        {sent ? (
          <span className="rounded-full border border-white/30 bg-white/[.14] px-7 py-3 text-[14.5px] font-bold">
            Thank you! We'll call you back shortly.
          </span>
        ) : (
          <>
            <div className="flex w-full max-w-[520px] gap-2.5 max-[430px]:flex-col">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                type="tel"
                inputMode="numeric"
                placeholder="Enter your phone number"
                aria-label="Phone number"
                className="min-w-0 flex-1 rounded-full border-none bg-white px-[22px] py-3.5 text-[14.5px] text-ink outline-none"
              />
              <button
                onClick={submit}
                disabled={submitting}
                className="cursor-pointer whitespace-nowrap rounded-full bg-[linear-gradient(90deg,#2AA7A5,#7FD1CB)] px-[30px] py-3.5 font-display text-sm font-semibold text-navy transition-transform hover:-translate-y-px disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Request Callback"}
              </button>
            </div>
            {error && <span className="text-[13px] font-bold text-[#FFD9D2]">{error}</span>}
          </>
        )}
      </div>
    </section>
  );
}
