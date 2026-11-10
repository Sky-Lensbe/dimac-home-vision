/** Published policy values, not a booking, billing or deletion engine. */
export const LEGAL_POLICY = {
  updated: "2026-11-10",
  reportWorkingDays: 7,
  paymentCalendarDays: 14,
  freeCancellationHours: 48,
  proposedLateCancellationPercent: 50,
  cancellationRequiresLegalApproval: true,
  withdrawalCalendarDays: 14,
  travelFee: 0,
  nonCustomerRetentionMonths: 12,
  automaticRetentionVerified: false,
  withdrawalOverridesCancellation: true,
  marketingRequiredForReport: false,
  thirdPartyOwnMarketingAllowed: false,
} as const;