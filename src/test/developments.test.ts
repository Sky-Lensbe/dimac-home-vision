import { describe, expect, it } from "vitest";
import { developments, getDevelopment } from "@/data/developments";

describe("confirmed projects", () => {
  it("contains the five requested locations", () => {
    expect(developments.map((project) => project.location)).toEqual([
      "Diest", "Herk-de-Stad", "Paal", "Schaffen", "Schulen",
    ]);
  });

  it("assigns the supplied photographs to Diest and Herk-de-Stad", () => {
    const diest = getDevelopment("diest");
    expect(diest?.name).toBe("Vrijstaande woning Diest");
    expect(diest?.cover).toBeTruthy();
    expect(diest?.gallery).toHaveLength(2);

    const herk = getDevelopment("herk-de-stad");
    expect(herk?.name).toBe("Project Herk-de-Stad");
    expect(herk?.cover).toBeTruthy();
    expect(herk?.gallery).toHaveLength(1);

    expect(developments.filter((project) => project.slug !== "diest" && project.slug !== "herk-de-stad").every((project) => !project.cover && !project.gallery)).toBe(true);
  });
});