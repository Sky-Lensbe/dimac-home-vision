/**
 * Bevestigde projecten van Dimac, zonder eigendomsvermelding.
 *
 * Voeg hier uitsluitend projecten toe die Dimac effectief bevestigd heeft.
 * Zolang de lijst leeg is, toont de site geen projectkaarten maar een
 * uitleg over de ontwikkelingsaanpak. Status alleen invullen indien feitelijk juist.
 */

export type DevelopmentStatus = "In ontwikkeling" | "Gerealiseerd" | "Te koop";
export type DevelopmentType = "Nieuwbouw" | "Transformatie" | "Grondige renovatie";

export interface Development {
  slug: string;
  name: string;
  location: string;
  type?: DevelopmentType;
  status?: DevelopmentStatus;
  cover?: string;
  coverAlt: string;
  gallery?: { src: string; alt: string }[];
  video?: string;
  summary?: string;
  originalSituation?: string;
  vision?: string;
  interventions?: string[];
  result?: string;
}

import diestLiving from "@/assets/diest-woonruimte.jpg.asset.json";
import diestLivingTwo from "@/assets/diest-woonruimte-2.jpg.asset.json";
import diestKitchen from "@/assets/diest-keuken.jpg.asset.json";
import herkGevel from "@/assets/herk-de-stad-gevel.jpg.asset.json";
import herkBadkamer from "@/assets/herk-de-stad-badkamer.jpg.asset.json";
import paalGevel from "@/assets/paal-gevel.jpg.asset.json";
import paalBadkamer from "@/assets/paal-badkamer.jpg.asset.json";
import paalBadkamerTwee from "@/assets/paal-badkamer-2.jpg.asset.json";
import paalKeuken from "@/assets/paal-keuken.jpg.asset.json";
import paalTerras from "@/assets/paal-terras.jpg.asset.json";
import paalTerrasTwee from "@/assets/paal-terras-2.jpg.asset.json";
import schaffenGevel from "@/assets/schaffen-gevel.jpg.asset.json";
import schaffenBadkamer from "@/assets/schaffen-badkamer.jpg.asset.json";
import schaffenWoonruimte from "@/assets/schaffen-woonruimte.jpg.asset.json";
import schaffenTrap from "@/assets/schaffen-trap.jpg.asset.json";

export const developments: Development[] = [
  {
    slug: "diest",
    name: "Vrijstaande woning Diest",
    location: "Diest",
    cover: diestLiving.url,
    coverAlt: "Woonruimte van de vrijstaande woning in Diest",
    gallery: [
      { src: diestLivingTwo.url, alt: "Tweede zicht op de woonruimte in Diest" },
      { src: diestKitchen.url, alt: "Keuken van de vrijstaande woning in Diest" },
    ],
  },
  {
    slug: "herk-de-stad",
    name: "Project Herk-de-Stad",
    location: "Herk-de-Stad",
    cover: herkGevel.url,
    coverAlt: "Gevel van het project in Herk-de-Stad",
    gallery: [
      { src: herkBadkamer.url, alt: "Badkamer van het project in Herk-de-Stad" },
    ],
  },
  {
    slug: "paal",
    name: "Project Paal",
    location: "Paal",
    cover: paalGevel.url,
    coverAlt: "Gevel van het project in Paal",
    gallery: [
      { src: paalBadkamer.url, alt: "Badkamer van het project in Paal" },
      { src: paalBadkamerTwee.url, alt: "Tweede zicht op de badkamer in Paal" },
      { src: paalKeuken.url, alt: "Keuken van het project in Paal" },
      { src: paalTerras.url, alt: "Overdekt terras van het project in Paal" },
      { src: paalTerrasTwee.url, alt: "Tweede zicht op het overdekte terras in Paal" },
    ],
  },
  {
    slug: "schaffen",
    name: "Project Schaffen",
    location: "Schaffen",
    coverAlt: "Schaffen",
  },
  {
    slug: "schulen",
    name: "Project Schulen",
    location: "Schulen",
    coverAlt: "Schulen",
  },
];

export function getDevelopment(slug?: string) {
  return developments.find((d) => d.slug === slug);
}
