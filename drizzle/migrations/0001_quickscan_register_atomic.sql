CREATE OR REPLACE FUNCTION public.quickscan_register(
  p_report_number text,
  p_lead jsonb,
  p_responses jsonb,
  p_report jsonb,
  p_events jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_existing jsonb;
  v_lead_id uuid;
BEGIN
  -- Serialiseer gelijktijdige indieningen met hetzelfde rapportnummer binnen deze transactie.
  PERFORM pg_advisory_xact_lock(hashtextextended('quickscan:' || p_report_number, 0));

  SELECT report_snapshot INTO v_existing FROM public.quickscan_reports WHERE report_number = p_report_number;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('duplicate', true, 'snapshot', v_existing);
  END IF;

  BEGIN
    INSERT INTO public.quickscan_leads (first_name, last_name, email, phone, municipality, postal_code, situation, property_type,
      construction_period, decision_timing, marketing_consent, consent_version, consent_timestamp)
    SELECT r.first_name, r.last_name, r.email, r.phone, r.municipality, r.postal_code, r.situation, r.property_type,
      r.construction_period, r.decision_timing, coalesce(r.marketing_consent, false), r.consent_version, r.consent_timestamp
    FROM jsonb_populate_record(NULL::public.quickscan_leads, p_lead) r
    RETURNING id INTO v_lead_id;

    INSERT INTO public.quickscan_responses (lead_id, question_id, answer_value, question_version)
    SELECT v_lead_id, x->>'question_id', x->'answer_value', x->>'question_version'
    FROM jsonb_array_elements(coalesce(p_responses, '[]'::jsonb)) x;

    INSERT INTO public.quickscan_reports (lead_id, report_number, rule_version, report_version, barometer_score_internal,
      barometer_category, information_coverage, domain_scores, safety_flags, attention_points, unknown_information,
      combination_advice, recommended_package, drone_recommendation, report_snapshot, delivery_status)
    SELECT v_lead_id, p_report_number, r.rule_version, r.report_version, r.barometer_score_internal,
      r.barometer_category, r.information_coverage, r.domain_scores, r.safety_flags, r.attention_points, r.unknown_information,
      r.combination_advice, r.recommended_package, coalesce(r.drone_recommendation, false), r.report_snapshot, coalesce(r.delivery_status, 'aangemaakt')
    FROM jsonb_populate_record(NULL::public.quickscan_reports, p_report) r;

    INSERT INTO public.quickscan_events (lead_id, event_type, detail)
    SELECT v_lead_id, x->>'event_type', x->>'detail'
    FROM jsonb_array_elements(coalesce(p_events, '[]'::jsonb)) x;
  EXCEPTION WHEN unique_violation THEN
    -- Alle inserts van deze poging zijn teruggedraaid; geef het reeds bestaande rapport terug indien aanwezig.
    SELECT report_snapshot INTO v_existing FROM public.quickscan_reports WHERE report_number = p_report_number;
    IF v_existing IS NOT NULL THEN
      RETURN jsonb_build_object('duplicate', true, 'snapshot', v_existing);
    END IF;
    RAISE;
  END;

  RETURN jsonb_build_object('duplicate', false, 'snapshot', p_report->'report_snapshot');
END;
$$;

REVOKE ALL ON FUNCTION public.quickscan_register(text, jsonb, jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.quickscan_register(text, jsonb, jsonb, jsonb, jsonb) TO service_role;