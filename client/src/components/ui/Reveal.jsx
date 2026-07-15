import { useEffect, useRef, useState } from "react";

// Scroll-reveal wrapper: fades/slides children in when they enter the viewport.
// `delay` (ms) staggers siblings; `y` sets the slide distance. Once the entrance
// finishes, the reveal classes are removed so the element's own transitions and
// hover transforms behave normally again.
export default function Reveal({ as: Tag = "div", delay = 0, y = 26, className = "", children }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState("hidden"); // hidden → revealing → done

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setPhase("done");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("revealing");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "revealing") return;
    const id = setTimeout(() => setPhase("done"), delay + 750);
    return () => clearTimeout(id);
  }, [phase, delay]);

  const revealing = phase !== "done";
  return (
    <Tag
      ref={ref}
      style={
        revealing ? { transitionDelay: `${delay}ms`, "--reveal-y": `${y}px` } : undefined
      }
      className={
        revealing
          ? `co-reveal ${phase === "revealing" ? "co-reveal-visible" : ""} ${className}`
          : className
      }
    >
      {children}
    </Tag>
  );
}
