import { JsonStore } from "./jsonStore.js";
import { dataFile } from "./dataPaths.js";
const store = new JsonStore(() => dataFile("outbox.json"), []);
export const outboxRepo = {
    async list() {
        return store.read();
    },
    async saveAll(events) {
        await store.write(events);
    }
};
