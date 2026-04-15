import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
const store = new JsonStore(() => dataFile("classes.json"), []);
export const classesRepo = {
    async list() {
        return store.read();
    },
    async saveAll(classes) {
        await store.write(classes);
    }
};
