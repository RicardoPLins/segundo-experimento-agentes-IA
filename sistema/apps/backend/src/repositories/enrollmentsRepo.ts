import path from "path";
import { JsonStore } from "./jsonStore.js";
import type { Enrollment } from "../types.js";

const store = new JsonStore<Enrollment[]>(
  path.resolve("apps/backend/data/enrollments.json"),
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
