import { setWorldConstructor } from "@cucumber/cucumber";
import request from "supertest";
import type { ClassEntity, Student } from "../../src/types.js";

export class TestWorld {
  api!: request.SuperTest<request.Test>;
  lastResponse: request.Response | null = null;
  studentsByName = new Map<string, Student>();
  classesByTopic = new Map<string, ClassEntity>();
  digestEmails: Array<{ to: string; subject: string; body: string }> = [];
  dataDir: string | null = null;
}

setWorldConstructor(TestWorld);
