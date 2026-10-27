import { migrateAnswers, type Answers } from "@/lib/quickscan";

export type Stage = "intro" | "questions" | "preview" | "form" | "report";
export const SESSION_KEY = "dimac-quickscan-v2.2";
export const OLD_SESSION_KEY = "dimac-quickscan-v2.1";

export interface Saved { stage: Stage; answers: Answers; index: number; startedAt: number }

/** Leest opgeslagen voortgang: v2.2 rechtstreeks, v2.1 alleen via de veilige migratie. */
export function readSaved(store: Pick<Storage, "getItem" | "removeItem">): Saved | null {
  try {
    store.removeItem("dimac-quickscan-v1");
    const raw = store.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as Saved;
    const old = store.getItem(OLD_SESSION_KEY);
    if (!old) return null;
    store.removeItem(OLD_SESSION_KEY);
    const s = JSON.parse(old) as Saved;
    return { ...s, answers: migrateAnswers(s.answers ?? {}, "2.1") };
  } catch {
    return null;
  }
}
