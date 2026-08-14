/**
 * Lichte eventlaag voor marketingmeting.
 *
 * Er worden bewust geen externe scripts geladen (geen GA4, geen Meta Pixel,
 * geen measurement- of pixel-ID's). Events worden enkel naar window.dataLayer
 * gepusht, zodat een tagmanager later kan aansluiten zonder dat de
 * frontendinteracties opnieuw gebouwd moeten worden.
 */

export type TrackEvent =
  | "view_service"
  | "view_project"
  | "woningscan_view"
  | "woningscan_click"
  | "project_contact_start"
  | "project_contact_submit"
  | "phone_click"
  | "email_click"
  | "navigation_cta_click";

export interface TrackPayload {
  /** Type pagina waarop het event plaatsvindt, bv. "home", "service", "project". */
  page_type?: string;
  /** Identificatie van het item, bv. een dienst- of projectslug. */
  item_id?: string;
  /** Zichtbaar label van de aangeklikte call to action. */
  cta_label?: string;
}

interface DataLayerEntry extends TrackPayload {
  event: TrackEvent;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

export function track(event: TrackEvent, payload: TrackPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_type: payload.page_type,
    item_id: payload.item_id,
    cta_label: payload.cta_label,
  });
}
