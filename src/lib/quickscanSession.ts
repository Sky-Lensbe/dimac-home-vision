import { migrateAnswers, type Answers } from "@/lib/quickscan";

export type Stage = "intro" | "questions" | "preview" | "form" | "report";
export const SESSION_KEY = "dimac-quickscan-v2.3.2";
export const SESSION_KEY_221 = "dimac-quickscan-v2.2.1";
export const SESSION_KEY_22 = "dimac-quickscan-v2.2";
export const OLD_SESSION_KEY = "dimac-quickscan-v2.1";

export interface Saved { stage: Stage; answers: Answers; index: number; startedAt: number }

/**
 * Leest opgeslagen voortgang: v2.3.2 rechtstreeks; v2.2.1 hervat in de vragenlijst (zelfde vraag-ID's,
 * nieuw geactiveerde vragen worden door de resolver alsnog gesteld); v2.2 en v2.1, v2.2 en v2.1 alleen via de veilige migratie.
 * Een gemigreerde sessie hervat altijd in de vragenlijst, zodat een oud resultaat nooit als nieuw rapport verschijnt.
 */
export function readSaved(store: Pick<Storage, "getItem" | "removeItem">): Saved | null {
  try {
    store.removeItem("dimac-quickscan-v1");
    const raw = store.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Saved;
    const r221 = store.getItem(SESSION_KEY_221);
    if (r221) {
      store.removeItem(SESSION_KEY_221);
      const s = JSON.parse(r221) as Saved;
      return { ...s, stage: s.stage === "intro" ? "intro" : "questions", index: 0, answers: s.answers ?? {} };
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
