import path from "path";
import { JsonStore } from "./jsonStore.js";
import type { Evaluation } from "../types.js";

const store = new JsonStore<Evaluation[]>(
  path.resolve("apps/backend/data/evaluations.json"),
  []
);

export const evaluationsRepo = {
  async list(): Promise<Evaluation[]> {
    return store.read();
  },
  async saveAll(evaluations: Evaluation[]): Promise<void> {
    await store.write(evaluations);
  }
};
