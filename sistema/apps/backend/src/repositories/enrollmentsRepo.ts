import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
import type { Enrollment } from "../types.js";

const store = new JsonStore<Enrollment[]>(
  () => dataFile("enrollments.json"),
  []
);

export const enrollmentsRepo = {
  async list(): Promise<Enrollment[]> {
    return store.read();
  },
  async saveAll(enrollments: Enrollment[]): Promise<void> {
    await store.write(enrollments);
  }
};
