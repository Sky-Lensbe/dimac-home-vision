import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Eén lichte, gedeelde IntersectionObserver voor alle [data-reveal]-elementen.
 * - Observeert nieuwe elementen via een MutationObserver op documentniveau.
 * - Elk element animeert maximaal één keer (unobserve na reveal).
 * - Zonder JS of bij prefers-reduced-motion blijft alle content gewoon zichtbaar.
 */
export function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;

    if (typeof IntersectionObserver === "undefined") {
      root.classList.remove("reveal-ready");
      return;
    }

    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Alles wat al in beeld staat meteen tonen (hero niet vertragen).
          if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
            el.classList.add("is-visible");
          } else {
            observer.observe(el);
          }
        });
    };

    observeAll();

    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    // Vangnet: mocht er iets misgaan, dan blijft niets onzichtbaar hangen.
    const fallback = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add("is-visible");
          }
        });
    }, 1200);

    return () => {
      window.clearTimeout(fallback);
      mutation.disconnect();
      observer.disconnect();
    };
  }, [pathname]);
}
