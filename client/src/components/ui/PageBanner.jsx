import { Link } from "react-router-dom";
import Container from "../layout/Container";

// Compact sub-page banner: title + breadcrumb on the left, a full circular
// photo with teal gradient rings peeking out behind it on the right.
export default function PageBanner({ title, crumb, image, imageAlt = "" }) {
  return (
    <section className="relative overflow-hidden bg-soft">
      <div className="absolute -right-20 -top-36 h-[340px] w-[340px] rounded-full bg-teal-pale/40" />
      <Container className="relative flex items-center justify-between gap-10 py-[clamp(28px,4vw,48px)] max-sm:py-7">
        <div>
          <h1 className="mb-2 font-display text-[clamp(28px,4vw,42px)] font-semibold text-navy">
            {title}
          </h1>
          <div className="flex items-center gap-2 text-[13.5px]">
            <Link to="/" className="text-muted transition-colors hover:text-teal">
              Home
            </Link>
            <span className="text-[#B9C4D6]">/</span>
            <span className="font-bold text-teal">{crumb || title}</span>
          </div>
        </div>
        {image && (
          <div className="relative flex-none max-sm:hidden">
            <div className="absolute -left-5 -top-4 h-[45%] w-[45%] rounded-full bg-[linear-gradient(200deg,#BFE3E2,#7FC9C7)]" />
            <div className="absolute -bottom-4 -right-5 h-[52%] w-[52%] rounded-full bg-[linear-gradient(200deg,#2AA7A5,#0E7C7B)]" />
            <img
              src={image}
              alt={imageAlt}
              className="relative h-[min(18vw,190px)] w-[min(18vw,190px)] rounded-full border-4 border-white object-cover shadow-[0_16px_36px_rgba(20,53,92,0.18)]"
            />
          </div>
        )}
      </Container>
    </section>
  );
}
