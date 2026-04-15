import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import type { TestWorld } from "./world.js";

Given(
  "a student named {string} with cpf {string} and email {string} exists",
  async function (this: TestWorld, name: string, cpf: string, email: string) {
    const response = await this.api.post("/students").send({ name, cpf, email });
    assert.equal(response.status, 201);
    this.studentsByName.set(name, response.body);
  }
);

When(
  "I create a student named {string} with cpf {string} and email {string}",
  async function (this: TestWorld, name: string, cpf: string, email: string) {
    this.lastResponse = await this.api.post("/students").send({ name, cpf, email });
    if (this.lastResponse.status === 201) {
      this.studentsByName.set(name, this.lastResponse.body);
    }
  }
);

Then("the student is created", function (this: TestWorld) {
  assert.ok(this.lastResponse);
  assert.equal(this.lastResponse?.status, 201);
});

Then("the students list includes {string}", async function (this: TestWorld, name: string) {
  const response = await this.api.get("/students");
  assert.equal(response.status, 200);
  assert.ok(response.body.some((s: { name: string }) => s.name === name));
});

Then('the request fails with status {int}', function (this: TestWorld, status: number) {
  assert.ok(this.lastResponse);
  assert.equal(this.lastResponse?.status, status);
});

Given(
  "a class with topic {string} year {int} semester {int} exists",
  async function (this: TestWorld, topic: string, year: number, semester: number) {
    const response = await this.api.post("/classes").send({ topic, year, semester });
    assert.equal(response.status, 201);
    this.classesByTopic.set(topic, response.body);
  }
);

When(
  "I create a class with topic {string} year {int} semester {int}",
  async function (this: TestWorld, topic: string, year: number, semester: number) {
    this.lastResponse = await this.api.post("/classes").send({ topic, year, semester });
    if (this.lastResponse.status === 201) {
      this.classesByTopic.set(topic, this.lastResponse.body);
    }
  }
);

Then("the class is created", function (this: TestWorld) {
  assert.ok(this.lastResponse);
  assert.equal(this.lastResponse?.status, 201);
});

When(
  "I enroll {string} into {string}",
  async function (this: TestWorld, studentName: string, topic: string) {
    const student = this.studentsByName.get(studentName);
    const classEntity = this.classesByTopic.get(topic);
    assert.ok(student && classEntity);
    this.lastResponse = await this.api.post(
      `/classes/${classEntity!.id}/students/${student!.id}`
    );
  }
);

Then(
  "the class roster for {string} includes {string}",
  async function (this: TestWorld, topic: string, studentName: string) {
    const classEntity = this.classesByTopic.get(topic);
    assert.ok(classEntity);
    const response = await this.api.get(`/classes/${classEntity!.id}/students`);
    assert.equal(response.status, 200);
    assert.ok(response.body.some((s: { name: string }) => s.name === studentName));
  }
);

Given("{string} is enrolled in {string}", async function (this: TestWorld, studentName: string, topic: string) {
  const student = this.studentsByName.get(studentName);
  const classEntity = this.classesByTopic.get(topic);
  assert.ok(student && classEntity);
  const response = await this.api.post(`/classes/${classEntity!.id}/students/${student!.id}`);
  assert.ok([200, 204].includes(response.status));
});

When(
  "I set meta {string} to {string} for {string} in {string}",
  async function (
    this: TestWorld,
    meta: string,
    status: string,
    studentName: string,
    topic: string
  ) {
    const student = this.studentsByName.get(studentName);
    const classEntity = this.classesByTopic.get(topic);
    assert.ok(student && classEntity);
    this.lastResponse = await this.api
      .put(`/classes/${classEntity!.id}/evaluations/${student!.id}`)
      .send({ meta, status });
  }
);

Then(
  "the evaluations table for {string} shows {string} has {string} = {string}",
  async function (this: TestWorld, topic: string, studentName: string, meta: string, status: string) {
    const classEntity = this.classesByTopic.get(topic);
    assert.ok(classEntity);
    const response = await this.api.get(`/classes/${classEntity!.id}/evaluations`);
    assert.equal(response.status, 200);
    const row = response.body.rows.find((r: { studentName: string }) => r.studentName === studentName);
    assert.ok(row);
    assert.equal(row.metas[meta], status);
  }
);

When("I run the daily digest job", async function (this: TestWorld) {
  const response = await this.api.post("/jobs/send-daily-digests").send({});
  assert.equal(response.status, 200);
  this.digestEmails = response.body.sent;
});

Then("one digest email is sent to {string}", function (this: TestWorld, email: string) {
  const matches = this.digestEmails.filter((e) => e.to === email);
  assert.equal(matches.length, 1);
});

Then("the digest includes {string} and {string}", function (this: TestWorld, metaA: string, metaB: string) {
  assert.ok(this.digestEmails.length > 0);
  const body = this.digestEmails[0].body;
  assert.ok(body.includes(metaA));
  assert.ok(body.includes(metaB));
});
