import { describe, expect, it } from "vitest";
import { developments, getDevelopment } from "@/data/developments";

describe("confirmed projects", () => {
  it("contains the five requested locations", () => {
    expect(developments.map((project) => project.location)).toEqual([
      "Diest", "Herk-de-Stad", "Paal", "Schaffen", "Schulen",
    ]);
  });

  it("assigns the supplied photographs to Diest, Herk-de-Stad, Paal, Schaffen and Schulen", () => {
    const diest = getDevelopment("diest");
    expect(diest?.name).toBe("Vrijstaande woning Diest");
    expect(diest?.cover).toBeTruthy();
    expect(diest?.gallery).toHaveLength(2);

    const herk = getDevelopment("herk-de-stad");
    expect(herk?.name).toBe("Project Herk-de-Stad");
    expect(herk?.cover).toBeTruthy();
    expect(herk?.gallery).toHaveLength(1);

    const paal = getDevelopment("paal");
    expect(paal?.name).toBe("Project Paal");
    expect(paal?.cover).toBeTruthy();
    expect(paal?.gallery).toHaveLength(5);

    const schaffen = getDevelopment("schaffen");
    expect(schaffen?.name).toBe("Project Schaffen");
    expect(schaffen?.cover).toBeTruthy();
    expect(schaffen?.gallery).toHaveLength(3);

    const schulen = getDevelopment("schulen");
    expect(schulen?.name).toBe("Project Schulen");
    expect(schulen?.cover).toBeTruthy();
    expect(schulen?.gallery).toHaveLength(8);

    expect(developments.every((project) => project.cover && project.gallery)).toBe(true);
  });
});