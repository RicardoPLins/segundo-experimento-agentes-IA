import path from "path";
import { JsonStore } from "./jsonStore.js";
import type { EvaluationChangeEvent } from "../types.js";

const store = new JsonStore<EvaluationChangeEvent[]>(
  path.resolve("apps/backend/data/outbox.json"),
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
