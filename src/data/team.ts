/**
 * Teamleden van Dimac.
 *
 * Deze lijst blijft leeg tot Dimac echte namen, functies en authentieke foto's
 * aanlevert. Zolang de array leeg is, rendert de teamsectie niet.
 * Gebruik hier nooit stockportretten of verzonnen personen.
 */
export interface TeamMember {
  name: string;
  role: string;
  /** Pad naar een authentieke Dimac-foto. */
  image: string;
  description?: string;
}

export const team: TeamMember[] = [];
