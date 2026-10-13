import { describe, expect, it } from "vitest";
import { developments, getDevelopment } from "@/data/developments";

describe("confirmed projects", () => {
  it("contains the five requested locations", () => {
    expect(developments.map((project) => project.location)).toEqual([
      "Diest", "Herk-de-Stad", "Paal", "Schaffen", "Schulen",
    ]);
  });

  it("assigns all three supplied photographs to the detached house in Diest", () => {
    const diest = getDevelopment("diest");
    expect(diest?.name).toBe("Vrijstaande woning Diest");
    expect(diest?.cover).toBeTruthy();
    expect(diest?.gallery).toHaveLength(2);
    expect(developments.filter((project) => project.slug !== "diest").every((project) => !project.cover && !project.gallery)).toBe(true);
  });
});