import { describe, it, expect } from "vitest";
import {
  PRODUCTS,
  ONLINE_PRODUCTS,
  PHYSICAL_PRODUCTS,
  DRONE_PRICE,
  getProduct,
  getPackage,
  scanTotal,
  vatPart,
  formatEuro,
  formatPrice,
  parseScanParams,
} from "@/data/woningscan";
import { buildMailto } from "@/lib/mailto";

describe("vier Woningscan-producten", () => {
  it("exact vier producten met vaste ID's", () => {
    expect(PRODUCTS.map((p) => p.id)).toEqual(["quickscan", "online-budgetindicator", "woningscan", "woningscan-plus"]);
  });
  it("twee online en twee ter plaatse", () => {
    expect(ONLINE_PRODUCTS.map((p) => p.id)).toEqual(["quickscan", "online-budgetindicator"]);
    expect(PHYSICAL_PRODUCTS.map((p) => p.id)).toEqual(["woningscan", "woningscan-plus"]);
  });
  it("Quickscan is gratis en opent de bestaande vragenlijst", () => {
    expect(formatPrice(getProduct("quickscan")!)).toBe("Gratis");
    expect(getProduct("quickscan")!.ctaTo).toBe("/woningscan/quickscan");
  });
  it("online budgetraming kost €39,99, is binnenkort beschikbaar en niet koopbaar", () => {
    const b = getProduct("online-budgetindicator")!;
    expect(b.price).toBe(39.99);
    expect(formatEuro(b.price)).toBe("€39,99");
    expect(b.availability).toBe("coming_soon");
    expect(b.ctaTo).toBeNull();
    expect(getPackage("online-budgetindicator")).toBeUndefined();
  });
  it("Woningscan €299 en Woningscan Plus €449, met juiste aanvraag-CTA", () => {
    expect(getProduct("woningscan")!.price).toBe(299);
    expect(getProduct("woningscan-plus")!.price).toBe(449);
    expect(getProduct("woningscan")!.ctaTo).toContain("pakket=woningscan#");
    expect(getProduct("woningscan-plus")!.ctaTo).toContain("pakket=woningscan-plus");
  });
  it("geen €649 en geen Basis/Compleet meer", () => {
    expect(PRODUCTS.some((p) => p.price === 649)).toBe(false);
    expect(PRODUCTS.some((p) => /basis|compleet/i.test(p.id + p.name))).toBe(false);
  });
});

describe("drone en totaal incl. btw", () => {
  it("drone €125 enkel bij fysieke scans", () => {
    expect(DRONE_PRICE).toBe(125);
    expect(PRODUCTS.filter((p) => p.droneAllowed).map((p) => p.id)).toEqual(["woningscan", "woningscan-plus"]);
    expect(() => scanTotal("quickscan", true)).toThrow();
    expect(() => scanTotal("online-budgetindicator", true)).toThrow();
  });
  it("totaal telt drone op zonder extra btw", () => {
    expect(scanTotal("woningscan", false)).toBe(299);
    expect(scanTotal("woningscan", true)).toBe(424);
    expect(scanTotal("woningscan-plus", false)).toBe(449);
    expect(scanTotal("woningscan-plus", true)).toBe(574);
  });
  it("btw-component uit inclusieve prijs (21%)", () => {
    expect(vatPart(121)).toBe(21);
  });
});

describe("queryparameters", () => {
  it("nieuwe pakketten worden geselecteerd", () => {
    expect(parseScanParams(new URLSearchParams("pakket=woningscan-plus&situatie=kopen"))).toEqual({ pakket: "woningscan-plus", situatie: "kopen", rapport: null });
  });
  it("oude basis/compleet/plus-links selecteren niets", () => {
    for (const old of ["basis", "compleet", "plus", "quickscan", "online-budgetindicator"]) {
      expect(parseScanParams(new URLSearchParams(`pakket=${old}`)).pakket).toBeNull();
    }
  });
});

describe("rechtstreeks contactalternatief", () => {
  it("algemene mailto blijft standaard naar info@dimac.be", () => {
    expect(buildMailto("X", []).startsWith("mailto:info@dimac.be?")).toBe(true);
  });
});

describe("Quickscan-referentie in de aanvraaglink", () => {
  it("een geldig rapportnummer wordt overgenomen, al het andere genegeerd", () => {
    expect(parseScanParams(new URLSearchParams("pakket=woningscan&rapport=QS-20261029-ABCDEF12")).rapport).toBe("QS-20261029-ABCDEF12");
    expect(parseScanParams(new URLSearchParams("pakket=woningscan&rapport=jan@example.com")).rapport).toBeNull();
  });
});
