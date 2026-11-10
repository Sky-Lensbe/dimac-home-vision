import { describe, expect, it } from "vitest";
import { LEGAL_POLICY as p } from "@/data/legal";
import { COMPANY } from "@/lib/site";
import { getPackage, DRONE_OPTION, scanTotal } from "@/data/woningscan";
import { buildMailto } from "@/lib/mailto";

describe("Confirmed legal policy (no billing or retention activation)", () => {
  it("uses the confirmed legal entity and contact details", () => {
    expect([COMPANY.legalName, COMPANY.street, COMPANY.postalCode, COMPANY.city, COMPANY.country, COMPANY.enterpriseNumber, COMPANY.vatNumber, COMPANY.phone, COMPANY.email]).toEqual(["DIMAC BV", "Schansstraat 8", "3290", "Diest", "België", "0479.917.693", "BE 0479.917.693", "013 35 53 35", "info@dimac.be"]);
  });
  it("keeps Woningscan at 299 euros", () => expect(getPackage("woningscan")?.price).toBe(299));
  it("keeps Plus at 449 euros", () => expect(getPackage("woningscan-plus")?.price).toBe(449));
  it("keeps the optional drone at 125 euros", () => expect(DRONE_OPTION.price).toBe(125));
  it("delivers within 7 working days", () => expect(p.reportWorkingDays).toBe(7));
  it("sets payment to 14 calendar days after delivery", () => expect(p.paymentCalendarDays).toBe(14));
  it("charges no separate travel fee", () => { expect(p.travelFee).toBe(0); expect(scanTotal("woningscan", false) + p.travelFee).toBe(299); });
  it("sets the free cancellation boundary to 48 actual hours", () => expect(p.freeCancellationHours).toBe(48));
  it("proposes 50 percent for late cancellation", () => expect(p.proposedLateCancellationPercent).toBe(50));
  it("requires legal approval before applying compensation", () => expect(p.cancellationRequiresLegalApproval).toBe(true));
  it("preserves the 14-day withdrawal period", () => expect(p.withdrawalCalendarDays).toBe(14));
  it("gives statutory withdrawal priority", () => expect(p.withdrawalOverridesCancellation).toBe(true));
  it("caps non-customer retention at 12 months", () => expect(p.nonCustomerRetentionMonths).toBe(12));
  it("does not claim verified automated retention", () => expect(p.automaticRetentionVerified).toBe(false));
  it("does not require marketing for reports", () => expect(p.marketingRequiredForReport).toBe(false));
  it("does not allow independent third-party marketing", () => expect(p.thirdPartyOwnMarketingAllowed).toBe(false));
  it("contact stays a mailto request to DIMAC", () => expect(buildMailto("Vraag", [["Naam", "Test"]])).toMatch(/^mailto:info@dimac\.be\?/));
});