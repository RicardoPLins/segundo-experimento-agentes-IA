import { setWorldConstructor } from "@cucumber/cucumber";
import request from "supertest";
import { createApp } from "../../src/app.js";
import type { ClassEntity, Student } from "../../src/types.js";

const app = createApp();

export class TestWorld {
  api = request(app);
  lastResponse: request.Response | null = null;
  studentsByName = new Map<string, Student>();
  classesByTopic = new Map<string, ClassEntity>();
  digestEmails: Array<{ to: string; subject: string; body: string }> = [];
}

setWorldConstructor(TestWorld);
