import { useEffect, useState } from "react";
import { Check, CheckCircle2, X } from "lucide-react";
import { api } from "../../lib/api";
import { enquiryServiceOptions } from "../../data/services";
import { site } from "../../data/site";

const initial = { name: "", phone: "", service: "", message: "" };

const inputCls =
  "w-full rounded-xl border-[1.5px] border-[#D5DEE9] px-4 py-[13px] text-[14.5px] text-ink outline-none transition focus:border-teal focus:shadow-[0_0_0_3px_rgba(14,124,123,0.12)]";

function validate(values) {
  const errors = {};
  const name = values.name.trim();
  if (name.length < 2 || name.length > 60) errors.name = "Please enter your name (2-60 characters).";
  if (!/^[6-9]\d{9}$/.test(values.phone.trim())) errors.phone = "Enter a valid 10-digit mobile number.";
  if (!enquiryServiceOptions.includes(values.service)) errors.service = "Please select a service.";
  if (values.message.length > 500) errors.message = "Message must be under 500 characters.";
  return errors;
}

// "Request a Callback" card, per the v2 design's Callback Form component.
export default function EnquiryForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!showToast) return;
    const id = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(id);
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      await api.post("/requests", {
        name: values.name.trim(),
        phone: values.phone.trim(),
        service: values.service,
        message: values.message.trim() || undefined,
      });
      setSent(true);
      setShowToast(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-[18px] rounded-[26px] border border-[#E7EEF4] bg-white p-9 shadow-[0_24px_56px_rgba(20,53,92,0.14)] max-sm:p-6">
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[100] w-[min(380px,calc(100vw-32px))] animate-[co-toast-in_0.4s_cubic-bezier(0.22,1,0.36,1)_both] overflow-hidden rounded-2xl border border-[#BFE0DF] bg-white shadow-[0_20px_48px_rgba(20,53,92,0.22)]"
        >
          <div className="flex items-start gap-3.5 p-4 pr-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#0E7C7B,#2AA7A5)]">
              <CheckCircle2 className="h-[22px] w-[22px] text-white" strokeWidth={2.2} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
              <span className="font-display text-[14.5px] font-semibold text-navy">
                Callback request sent!
              </span>
              <span className="text-[13px] leading-[1.55] text-body">
                Thank you — our care team will call you back shortly.
              </span>
            </div>
            <button
              onClick={() => setShowToast(false)}
              aria-label="Dismiss notification"
              className="ml-auto flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-field hover:text-navy"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
          <span className="block h-1 animate-[co-toast-bar_5s_linear_both] bg-[linear-gradient(90deg,#0E7C7B,#2AA7A5)]" />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <span className="font-display text-2xl font-bold text-navy">Request a Callback</span>
        <span className="text-sm text-[#6B7A93]">
          Fill in your details — our care team will call you back shortly.
        </span>
      </div>

      {sent ? (
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#BFE0DF] bg-[#E4F3F2] p-[22px]">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-teal">
            <Check className="h-[22px] w-[22px] text-white" strokeWidth={3} />
          </span>
          <div className="flex flex-col gap-[3px]">
            <span className="font-display text-base font-semibold text-navy">Request received!</span>
            <span className="text-sm text-[#54617A]">
              Our team will call you back shortly. For urgent care, call {site.phoneDisplay}.
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="enquiry-name" className="text-[13px] font-bold text-ink">
                Your Name
              </label>
              <input
                id="enquiry-name"
                name="name"
                type="text"
                placeholder="Full name"
                value={values.name}
                onChange={handleChange}
                className={inputCls}
              />
              {errors.name && <p className="text-xs font-bold text-[#C0392B]">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="enquiry-phone" className="text-[13px] font-bold text-ink">
                Phone Number
              </label>
              <input
                id="enquiry-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={values.phone}
                onChange={handleChange}
                className={inputCls}
              />
              {errors.phone && <p className="text-xs font-bold text-[#C0392B]">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="enquiry-service" className="text-[13px] font-bold text-ink">
              Service Needed
            </label>
            <select
              id="enquiry-service"
              name="service"
              value={values.service}
              onChange={handleChange}
              className={`${inputCls} bg-white ${values.service ? "" : "text-[#A8B4C8]"}`}
            >
              <option value="" disabled>
                Select a service…
              </option>
              {enquiryServiceOptions.map((option) => (
                <option key={option} value={option} className="text-ink">
                  {option}
                </option>
              ))}
            </select>
            {errors.service && <p className="text-xs font-bold text-[#C0392B]">{errors.service}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="enquiry-message" className="text-[13px] font-bold text-ink">
              Message <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="enquiry-message"
              name="message"
              rows={3}
              maxLength={500}
              placeholder="Tell us briefly about the patient's condition…"
              value={values.message}
              onChange={handleChange}
              className={`${inputCls} resize-y`}
            />
            {errors.message && <p className="text-xs font-bold text-[#C0392B]">{errors.message}</p>}
          </div>

          {serverError && (
            <p className="text-[13.5px] font-bold text-[#C0392B]">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-full bg-[linear-gradient(135deg,#0E7C7B,#14355C)] p-[15px] text-center font-display text-[15.5px] font-semibold text-white shadow-[0_10px_24px_rgba(14,124,123,0.30)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(14,124,123,0.40)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Request Callback"}
          </button>
        </form>
      )}
    </div>
  );
}
