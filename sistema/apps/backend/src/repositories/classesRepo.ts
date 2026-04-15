import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
import type { ClassEntity } from "../types.js";

const store = new JsonStore<ClassEntity[]>(
  () => dataFile("classes.json"),
  []
);

export const classesRepo = {
  async list(): Promise<ClassEntity[]> {
    return store.read();
  },
  async saveAll(classes: ClassEntity[]): Promise<void> {
    await store.write(classes);
  }
};
