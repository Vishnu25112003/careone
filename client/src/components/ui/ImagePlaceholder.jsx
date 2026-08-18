import { HeartPulse } from "lucide-react";

// Soft placeholder shown until real photos are provided.
export default function ImagePlaceholder({ label, className = "" }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[linear-gradient(200deg,#EBF5FC,#C0E0F5)] ${className}`}
    >
      <div className="text-center text-teal/70">
        <HeartPulse className="mx-auto h-14 w-14" strokeWidth={1.5} />
        {label && <p className="mt-3 text-sm font-semibold">{label}</p>}
      </div>
    </div>
  );
}
