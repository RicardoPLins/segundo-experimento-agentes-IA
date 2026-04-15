import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
import type { Evaluation } from "../types.js";

const store = new JsonStore<Evaluation[]>(
  () => dataFile("evaluations.json"),
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
