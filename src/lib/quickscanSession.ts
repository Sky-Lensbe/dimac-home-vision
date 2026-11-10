import { migrateAnswers, type Answers } from "@/lib/quickscan";

export type Stage = "intro" | "questions" | "preview" | "form" | "report";
export const SESSION_KEY = "dimac-quickscan-v2.3.4";
export const SESSION_KEY_233 = "dimac-quickscan-v2.3.3";
export const SESSION_KEY_232 = "dimac-quickscan-v2.3.2";
export const SESSION_KEY_221 = "dimac-quickscan-v2.2.1";
export const SESSION_KEY_22 = "dimac-quickscan-v2.2";
export const OLD_SESSION_KEY = "dimac-quickscan-v2.1";

export interface Saved { stage: Stage; answers: Answers; index: number; startedAt: number }

/** 2.3.4: een oud enkelvoudig H01-antwoord (2.3.3 en ouder) wordt een éénkeuze-array. */
const migrate234 = (answers: Answers): Answers =>
  typeof answers?.H01 === "string" ? { ...answers, H01: [answers.H01] } : (answers ?? {});

/**
 * Leest opgeslagen voortgang: v2.3.4 rechtstreeks; v2.3.3, v2.3.2 en v2.2.1 hervatten in de vragenlijst
 * (de antwoorden blijven geldig; nieuw toepasselijke vragen — bv. de hoofdverwarming bij meerdere systemen,
 * de warmteverdeling en de vloerverwarmingsvraag — worden door de resolver alsnog gesteld);
 * v2.2 en v2.1 alleen via de veilige migratie.
 * Een gemigreerde sessie hervat altijd in de vragenlijst, zodat een oud resultaat nooit als nieuw rapport verschijnt.
 */
export function readSaved(store: Pick<Storage, "getItem" | "removeItem">): Saved | null {
  try {
    store.removeItem("dimac-quickscan-v1");
    const raw = store.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Saved;
    for (const key of [SESSION_KEY_233, SESSION_KEY_232, SESSION_KEY_221]) {
      const prev = store.getItem(key);
      if (!prev) continue;
      store.removeItem(key);
      const s = JSON.parse(prev) as Saved;
      return { ...s, stage: s.stage === "intro" ? "intro" : "questions", index: 0, answers: migrate234(s.answers ?? {}) };
    }
    for (const [key, from] of [[SESSION_KEY_22, "2.2"], [OLD_SESSION_KEY, "2.1"]] as const) {
      const old = store.getItem(key);
      if (!old) continue;
      store.removeItem(key);
      const s = JSON.parse(old) as Saved;
      const stage: Stage = s.stage === "intro" ? "intro" : "questions";
      return { ...s, stage, index: 0, answers: migrateAnswers(s.answers ?? {}, from) };
    }
    return null;
  } catch {
    return null;
  }
}
