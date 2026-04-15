import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
const store = new JsonStore(() => dataFile("enrollments.json"), []);
export const enrollmentsRepo = {
    async list() {
        return store.read();
    },
    async saveAll(enrollments) {
        await store.write(enrollments);
    }
};
