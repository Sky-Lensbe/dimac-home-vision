import { describe, it, expect } from "vitest";
import { SCAN_PACKAGES, scanTotal, DRONE_PRICE } from "@/data/woningscan";
import { buildMailto } from "@/lib/mailto";

describe("woningscan prijzen", () => {
  it("Basis kost €299 en €424 met drone", () => {
    expect(scanTotal("basis", false)).toBe(299);
    expect(scanTotal("basis", true)).toBe(424);
  });
  it("Plus kost €449 en €574 met drone", () => {
    expect(scanTotal("plus", false)).toBe(449);
    expect(scanTotal("plus", true)).toBe(574);
  });
  it("Compleet kost €649 en €774 met drone", () => {
    expect(scanTotal("compleet", false)).toBe(649);
    expect(scanTotal("compleet", true)).toBe(774);
  });
  it("drone-optie kost €125", () => {
    expect(DRONE_PRICE).toBe(125);
  });
  it("Plus bevat geen kostenraming", () => {
    const plus = SCAN_PACKAGES.find((p) => p.id === "plus")!;
    expect(plus.items.some((i) => /kostenraming/i.test(i))).toBe(false);
  });
});

describe("mailto", () => {
  it("stuurt naar info@dimac.be met onderwerp en velden", () => {
    const url = buildMailto("Aanvraag", [["Pakket", "Plus"], ["Drone", "Ja"]]);
    expect(url.startsWith("mailto:info@dimac.be?subject=Aanvraag")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Pakket: Plus");
  });
});
