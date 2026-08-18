import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the anchor when the URL has a hash (e.g. /services#supportive-management),
// otherwise resets scroll position on route change.
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
