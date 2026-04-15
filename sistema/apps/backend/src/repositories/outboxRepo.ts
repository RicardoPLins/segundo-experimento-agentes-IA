import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
import type { EvaluationChangeEvent } from "../types.js";

const store = new JsonStore<EvaluationChangeEvent[]>(
  () => dataFile("outbox.json"),
  []
);

export const outboxRepo = {
  async list(): Promise<EvaluationChangeEvent[]> {
    return store.read();
  },
  async saveAll(events: EvaluationChangeEvent[]): Promise<void> {
    await store.write(events);
  }
};
