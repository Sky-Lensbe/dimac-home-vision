import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Eén lichte, gedeelde IntersectionObserver voor alle [data-reveal]-elementen.
 * - Observeert per routewijziging; nieuwe nodes worden via een throttled
 *   MutationObserver opgepikt die alleen kijkt naar toegevoegde element-nodes.
 * - Elk element animeert maximaal één keer (unobserve na reveal).
 * - Zonder JS of bij prefers-reduced-motion blijft alle content zichtbaar.
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

    const register = (el: Element) => {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      // Alles wat al in beeld staat meteen tonen (hero niet vertragen).
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    };

    const scan = (scope: ParentNode) => {
      if (scope instanceof Element && scope.matches("[data-reveal]")) register(scope);
      scope.querySelectorAll("[data-reveal]:not(.is-visible)").forEach(register);
    };

    scan(document.body);

    // Throttled: alleen toegevoegde element-nodes worden gescand, niet het
    // volledige document bij iedere kleine mutatie.
    let frame = 0;
    const pending: Element[] = [];
    const flush = () => {
      frame = 0;
      const nodes = pending.splice(0, pending.length);
      for (const node of nodes) {
        if (node.isConnected) scan(node);
      }
    };

    const mutation = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) pending.push(node as Element);
        }
      }
      if (pending.length && !frame) frame = window.requestAnimationFrame(flush);
    });
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
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      mutation.disconnect();
      observer.disconnect();
    };
  }, [pathname]);
}
