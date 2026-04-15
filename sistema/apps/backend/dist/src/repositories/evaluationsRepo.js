import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
const store = new JsonStore(() => dataFile("evaluations.json"), []);
export const evaluationsRepo = {
    async list() {
        return store.read();
    },
    async saveAll(evaluations) {
        await store.write(evaluations);
    }
};
