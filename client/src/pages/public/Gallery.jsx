import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import Container from "../../components/layout/Container";
import PageBanner from "../../components/ui/PageBanner";
import Reveal from "../../components/ui/Reveal";
import { api } from "../../lib/api";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/gallery")
      .then((data) => setImages(Array.isArray(data) ? data : []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageBanner title="Gallery" image="/images/hero-gallery.png" imageAlt="CareOne moments" />

      <section className="pb-[clamp(48px,6vw,80px)] pt-[clamp(36px,4.5vw,56px)]">
        <Container>
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[270px] animate-pulse rounded-2xl bg-field" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="py-8 text-center">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint text-teal">
                <Images className="h-10 w-10" strokeWidth={1.5} />
              </span>
              <h2 className="mt-6 font-display text-2xl font-semibold text-navy">
                Gallery coming soon
              </h2>
              <p className="mt-2 text-[15px] text-body">
                We are putting together moments from our care journeys. Check back shortly!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-5">
              {images.map((img, i) => (
                <Reveal
                  key={img.id}
                  as="figure"
                  delay={(i % 4) * 90}
                  y={34}
                  className="group overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_26px_rgba(20,51,102,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,51,102,0.14)]"
                >
                  <div className="h-[230px] overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt={img.title || "CareOne gallery image"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {img.title && (
                    <figcaption className="px-4 py-3 font-display text-sm font-medium text-navy">
                      {img.title}
                    </figcaption>
                  )}
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
