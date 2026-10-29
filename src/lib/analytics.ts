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
  | "navigation_cta_click"
  | "quickscan_view"
  | "quickscan_start"
  | "quickscan_step_complete"
  | "quickscan_result_preview"
  | "quickscan_lead_form_view"
  | "quickscan_lead_submit_attempt"
  | "quickscan_lead_saved"
  | "quickscan_report_generated"
  | "quickscan_email_accepted"
  | "quickscan_email_failed"
  | "quickscan_report_view"
  | "quickscan_report_download"
  | "quickscan_paid_scan_click"
  | "quickscan_next_step_click"
  | "quickscan_recommendation_shown"
  | "quickscan_recommendation_view"
  | "quickscan_recommendation_cta_click"
  | "quickscan_recommendation_compare_click"
  | "quickscan_recommendation_secondary_click"
  | "quickscan_drone_info_view"
  | "woningscan_quickscan_referral";

export interface TrackPayload {
  page_type?: string;
  item_id?: string;
  cta_label?: string;
  value?: number;
  enabled?: boolean;
  /** Vaste technische redenencode van de Quickscan-aanbeveling (nooit antwoorden of persoonsgegevens). */
  reason_code?: string;
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
