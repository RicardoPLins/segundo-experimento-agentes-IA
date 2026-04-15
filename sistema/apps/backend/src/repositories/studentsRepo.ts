import path from "path";
import { JsonStore } from "./jsonStore.js";
import type { Student } from "../types.js";

const store = new JsonStore<Student[]>(
  path.resolve("apps/backend/data/students.json"),
  []
);

export const studentsRepo = {
  async list(): Promise<Student[]> {
    return store.read();
  },
  async saveAll(students: Student[]): Promise<void> {
    await store.write(students);
  }
};
