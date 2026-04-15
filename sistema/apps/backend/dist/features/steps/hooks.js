import { After, Before } from "@cucumber/cucumber";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
Before(async function () {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "web-scholar-"));
    this.dataDir = dir;
    process.env.WEB_SCHOLAR_DATA_DIR = dir;
    const { createApp } = await import("../../src/app.js");
    const app = createApp();
    this.api = request(app);
    this.lastResponse = null;
    this.studentsByName.clear();
    this.classesByTopic.clear();
    this.digestEmails = [];
});
After(async function () {
    if (this.dataDir) {
        await fs.rm(this.dataDir, { recursive: true, force: true });
        this.dataDir = null;
    }
});
