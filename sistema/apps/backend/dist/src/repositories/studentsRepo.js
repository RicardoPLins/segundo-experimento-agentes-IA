import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
const store = new JsonStore(() => dataFile("students.json"), []);
export const studentsRepo = {
    async list() {
        return store.read();
    },
    async saveAll(students) {
        await store.write(students);
    }
};
