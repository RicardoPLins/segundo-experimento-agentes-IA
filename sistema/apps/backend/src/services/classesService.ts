import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";
import { NotFoundError, ValidationError } from "../errors.js";
import type { ClassEntity } from "../types.js";
import { classesRepo } from "../repositories/classesRepo.js";
import { enrollmentsRepo } from "../repositories/enrollmentsRepo.js";
import { evaluationsRepo } from "../repositories/evaluationsRepo.js";
import { outboxRepo } from "../repositories/outboxRepo.js";

const now = () => DateTime.utc().toISO();

export const classesService = {
  async list(): Promise<ClassEntity[]> {
    return classesRepo.list();
  },

  async create(input: Pick<ClassEntity, "topic" | "year" | "semester">): Promise<ClassEntity> {
    if (!input.topic || !input.year || !input.semester) {
      throw new ValidationError("topic, year, and semester are required");
    }
    if (![1, 2].includes(input.semester)) {
      throw new ValidationError("semester must be 1 or 2");
    }
    const classes = await classesRepo.list();
    const timestamp = now();
    const entity: ClassEntity = {
      id: uuid(),
      topic: input.topic,
      year: input.year,
      semester: input.semester,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await classesRepo.saveAll([...classes, entity]);
    return entity;
  },

  async getById(id: string): Promise<ClassEntity> {
    const classes = await classesRepo.list();
    const entity = classes.find((c) => c.id === id);
    if (!entity) {
      throw new NotFoundError("class not found");
    }
    return entity;
  },

  async update(id: string, input: Partial<Pick<ClassEntity, "topic" | "year" | "semester">>): Promise<ClassEntity> {
    const classes = await classesRepo.list();
    const index = classes.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundError("class not found");
    }
    const current = classes[index];
    const next: ClassEntity = {
      ...current,
      topic: input.topic ?? current.topic,
      year: input.year ?? current.year,
      semester: input.semester ?? current.semester,
      updatedAt: now()
    };
    if (!next.topic || !next.year || !next.semester) {
      throw new ValidationError("topic, year, and semester are required");
    }
    if (![1, 2].includes(next.semester)) {
      throw new ValidationError("semester must be 1 or 2");
    }
    const updated = [...classes];
    updated[index] = next;
    await classesRepo.saveAll(updated);
    return next;
  },

  async remove(id: string): Promise<void> {
    const classes = await classesRepo.list();
    const entity = classes.find((c) => c.id === id);
    if (!entity) {
      throw new NotFoundError("class not found");
    }
    const [enrollments, evaluations, events] = await Promise.all([
      enrollmentsRepo.list(),
      evaluationsRepo.list(),
      outboxRepo.list()
    ]);

    await enrollmentsRepo.saveAll(enrollments.filter((e) => e.classId !== id));
    await evaluationsRepo.saveAll(evaluations.filter((e) => e.classId !== id));
    await outboxRepo.saveAll(events.filter((e) => e.classId !== id));
    await classesRepo.saveAll(classes.filter((c) => c.id !== id));
  }
};
