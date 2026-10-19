import { describe, it, expect } from "vitest";
import { SCAN_PACKAGES, scanTotal, DRONE_PRICE } from "@/data/woningscan";
import { buildMailto } from "@/lib/mailto";
import { parseScanParams } from "@/data/woningscan";

describe("woningscan prijzen", () => {
  it("Basis kost €299 en €424 met drone", () => {
    expect(scanTotal("basis", false)).toBe(299);
    expect(scanTotal("basis", true)).toBe(424);
  });
  it("Plus bestaat niet meer en een oude Plus-link kiest geen pakket", () => {
    expect(SCAN_PACKAGES.map((p) => p.id)).toEqual(["basis", "compleet"]);
    expect(parseScanParams(new URLSearchParams("pakket=plus")).pakket).toBeNull();
  });
  it("Compleet kost €649 en €774 met drone", () => {
    expect(scanTotal("compleet", false)).toBe(649);
    expect(scanTotal("compleet", true)).toBe(774);
  });
  it("drone-optie kost €125", () => {
    expect(DRONE_PRICE).toBe(125);
  });

});

describe("mailto", () => {
  it("stuurt naar info@dimac.be met onderwerp en velden", () => {
    const url = buildMailto("Aanvraag", [["Pakket", "Basis"], ["Drone", "Ja"]]);
    expect(url.startsWith("mailto:info@dimac.be?subject=Aanvraag")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Pakket: Basis");
  });
});

import { getPackage } from "@/data/woningscan";
describe("woningscan queryparameters en inhoud", () => {
  it("leest pakket en situatie samen", () => {
    expect(parseScanParams(new URLSearchParams("pakket=compleet&situatie=kopen"))).toEqual({ pakket: "compleet", situatie: "kopen" });
  });
  it("negeert ongeldige waarden", () => {
    expect(parseScanParams(new URLSearchParams("pakket=xl&situatie=huren"))).toEqual({ pakket: null, situatie: null });
  });
  it("Basis bevat geen kostenraming of fotodocumentatie", () => {
    expect(getPackage("basis")!.items.some((i) => /kostenraming|fotodocumentatie/i.test(i))).toBe(false);
  });
  it("Compleet bevat een indicatieve kostenraming", () => {
    expect(getPackage("compleet")!.items.some((i) => /indicatieve.*kostenraming/i.test(i))).toBe(true);
  });
});
