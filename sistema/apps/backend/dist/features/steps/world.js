import { setWorldConstructor } from "@cucumber/cucumber";
export class TestWorld {
    api;
    lastResponse = null;
    studentsByName = new Map();
    classesByTopic = new Map();
    digestEmails = [];
    dataDir = null;
}
setWorldConstructor(TestWorld);
