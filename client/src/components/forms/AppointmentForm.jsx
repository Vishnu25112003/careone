import { useState } from "react";
import { Check } from "lucide-react";
import { api } from "../../lib/api";
import { enquiryServiceOptions } from "../../data/services";

const inputCls =
  "w-full rounded-[10px] border-[1.5px] border-transparent bg-field px-4 py-[13px] text-sm text-ink outline-none transition focus:border-teal focus:bg-white";

// Compact "Make an Appointment" strip on the home page.
export default function AppointmentForm() {
  const [values, setValues] = useState({ name: "", phone: "", service: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  async function submit() {
    const name = values.name.trim();
    const phone = values.phone.trim();
    if (name.length < 2 || !phone) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/requests", {
        name,
        phone,
        service: values.service || "Not sure — need guidance",
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-teal-pale bg-mint px-5 py-4">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal">
          <Check className="h-[18px] w-[18px] text-white" strokeWidth={3} />
        </span>
        <span className="text-[14.5px] font-bold text-navy">
          Request received — our care team will call you back shortly.
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] items-center gap-3">
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Your name"
          aria-label="Your name"
          className={inputCls}
        />
        <input
          name="phone"
          value={values.phone}
          onChange={handleChange}
          type="tel"
          inputMode="numeric"
          placeholder="Phone number"
          aria-label="Phone number"
          className={inputCls}
        />
        <select
          name="service"
          value={values.service}
          onChange={handleChange}
          aria-label="Service needed"
          className={`${inputCls} px-3 ${values.service ? "" : "text-[#A8B4C8]"}`}
        >
          <option value="">Service needed…</option>
          {enquiryServiceOptions.map((option) => (
            <option key={option} value={option} className="text-ink">
              {option}
            </option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={submitting}
          className="cursor-pointer whitespace-nowrap rounded-full bg-[linear-gradient(90deg,#1B74B7,#3FA0D8)] px-[30px] py-[13px] font-display text-sm font-medium text-white shadow-[0_8px_18px_rgba(27,116,183,0.28)] transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Book Appointment"}
        </button>
      </div>
      {error && <span className="text-[13px] font-bold text-[#C0392B]">{error}</span>}
    </>
  );
}
