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

import diestLiving from "@/assets/diest-woonruimte.jpg?url";
import diestLivingTwo from "@/assets/diest-woonruimte-2.jpg?url";
import diestKitchen from "@/assets/diest-keuken.jpg?url";
import herkGevel from "@/assets/herk-de-stad-gevel.jpg?url";
import herkBadkamer from "@/assets/herk-de-stad-badkamer.jpg?url";
import paalGevel from "@/assets/paal-gevel.jpg?url";
import paalBadkamer from "@/assets/paal-badkamer.jpg?url";
import paalBadkamerTwee from "@/assets/paal-badkamer-2.jpg?url";
import paalKeuken from "@/assets/paal-keuken.jpg?url";
import paalTerras from "@/assets/paal-terras.jpg?url";
import paalTerrasTwee from "@/assets/paal-terras-2.jpg?url";
import schaffenGevel from "@/assets/schaffen-gevel.jpg?url";
import schaffenBadkamer from "@/assets/schaffen-badkamer.jpg?url";
import schaffenWoonruimte from "@/assets/schaffen-woonruimte.jpg?url";
import schaffenTrap from "@/assets/schaffen-trap.jpg?url";
import schulenGevel from "@/assets/schulen-gevel.jpg?url";
import schulenWoonruimte from "@/assets/schulen-woonruimte.jpg?url";
import schulenBadkamer from "@/assets/schulen-badkamer.jpg?url";
import schulenBadkamerTwee from "@/assets/schulen-badkamer-2.jpg?url";
import schulenKeuken from "@/assets/schulen-keuken.jpg?url";
import schulenKeukenTwee from "@/assets/schulen-keuken-2.jpg?url";
import schulenTrap from "@/assets/schulen-trap.jpg?url";
import schulenGevelTwee from "@/assets/schulen-gevel-2.jpg?url";
import schulenGevelDrie from "@/assets/schulen-gevel-3.jpg?url";

export const developments: Development[] = [
  {
    slug: "diest",
    name: "Project Diest",
    location: "Diest",
    cover: diestLiving,
    coverAlt: "Woonruimte van de vrijstaande woning in Diest",
    gallery: [
      { src: diestLivingTwo, alt: "Tweede zicht op de woonruimte in Diest" },
      { src: diestKitchen, alt: "Keuken van de vrijstaande woning in Diest" },
    ],
  },
  {
    slug: "herk-de-stad",
    name: "Project Herk-de-Stad",
    location: "Herk-de-Stad",
    cover: herkGevel,
    coverAlt: "Gevel van het project in Herk-de-Stad",
    gallery: [
      { src: herkBadkamer, alt: "Badkamer van het project in Herk-de-Stad" },
    ],
  },
  {
    slug: "paal",
    name: "Project Paal",
    location: "Paal",
    cover: paalGevel,
    coverAlt: "Gevel van het project in Paal",
    gallery: [
      { src: paalBadkamer, alt: "Badkamer van het project in Paal" },
      { src: paalBadkamerTwee, alt: "Tweede zicht op de badkamer in Paal" },
      { src: paalKeuken, alt: "Keuken van het project in Paal" },
      { src: paalTerras, alt: "Overdekt terras van het project in Paal" },
      { src: paalTerrasTwee, alt: "Tweede zicht op het overdekte terras in Paal" },
    ],
  },
  {
    slug: "schaffen",
    name: "Project Schaffen",
    location: "Schaffen",
    cover: schaffenGevel,
    coverAlt: "Gevel van het project in Schaffen",
    gallery: [
      { src: schaffenBadkamer, alt: "Badkamer van het project in Schaffen" },
      { src: schaffenWoonruimte, alt: "Woonruimte van het project in Schaffen" },
      { src: schaffenTrap, alt: "Traphal van het project in Schaffen" },
    ],
  },
  {
    slug: "schulen",
    name: "Project Schulen",
    location: "Schulen",
    cover: schulenGevel,
    coverAlt: "Vooraanzicht van het project in Schulen",
    gallery: [
      { src: schulenWoonruimte, alt: "Woonruimte van het project in Schulen" },
      { src: schulenBadkamer, alt: "Badkamer van het project in Schulen" },
      { src: schulenBadkamerTwee, alt: "Tweede zicht op de badkamer in Schulen" },
      { src: schulenKeuken, alt: "Keuken van het project in Schulen" },
      { src: schulenKeukenTwee, alt: "Tweede zicht op de keuken in Schulen" },
      { src: schulenTrap, alt: "Traphal van het project in Schulen" },
      { src: schulenGevelTwee, alt: "Tweede zicht op de gevel in Schulen" },
      { src: schulenGevelDrie, alt: "Derde zicht op de gevel in Schulen" },
    ],
  },
];

export function getDevelopment(slug?: string) {
  return developments.find((d) => d.slug === slug);
}
