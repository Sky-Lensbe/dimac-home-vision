/**
 * Lichte eventlaag voor marketingmeting.
 *
 * Er worden geen externe scripts geladen. Events gaan enkel naar
 * window.dataLayer zodat een tagmanager later kan aansluiten.
 * Nooit persoonsgegevens meegeven. Een geopende mailapp is geen verzonden bericht.
 */

export type TrackEvent =
  | "woningscan_view"
  | "woningscan_click"
  | "woningscan_situation_select"
  | "woningscan_package_select"
  | "woningscan_drone_toggle"
  | "woningscan_request_start"
  | "woningscan_mailto_handoff"
  | "renovation_view"
  | "renovation_intake_start"
  | "renovation_mailto_handoff"
  | "contact_mailto_handoff"
  | "view_project"
  | "email_click"
  | "cta_click"
  | "navigation_cta_click";

export interface TrackPayload {
  page_type?: string;
  item_id?: string;
  cta_label?: string;
  value?: number;
  enabled?: boolean;
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
  window.dataLayer.push({ event, ...payload });
}
