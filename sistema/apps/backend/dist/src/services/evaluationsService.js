import { DateTime } from "luxon";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { evaluationsRepo } from "../repositories/evaluationsRepo.js";
import { enrollmentsRepo } from "../repositories/enrollmentsRepo.js";
import { classesRepo } from "../repositories/classesRepo.js";
import { studentsRepo } from "../repositories/studentsRepo.js";
import { outboxRepo } from "../repositories/outboxRepo.js";
import { META_KEYS, STATUS_VALUES } from "../constants.js";
import { v4 as uuid } from "uuid";
const now = () => DateTime.utc().toISO();
const isMeta = (value) => META_KEYS.includes(value);
const isStatus = (value) => STATUS_VALUES.includes(value);
export const evaluationsService = {
    async listByClass(classId) {
        const evaluations = await evaluationsRepo.list();
        return evaluations.filter((e) => e.classId === classId);
    },
    async update(classId, studentId, meta, status) {
        if (!isMeta(meta)) {
            throw new ValidationError("invalid meta");
        }
        if (!isStatus(status)) {
            throw new ValidationError("invalid status");
        }
        const classes = await classesRepo.list();
        if (!classes.some((c) => c.id === classId)) {
            throw new NotFoundError("class not found");
        }
        const students = await studentsRepo.list();
        if (!students.some((s) => s.id === studentId)) {
            throw new NotFoundError("student not found");
        }
        const enrollments = await enrollmentsRepo.list();
        if (!enrollments.some((e) => e.classId === classId && e.studentId === studentId)) {
            throw new ConflictError("student not enrolled in class");
        }
        const evaluations = await evaluationsRepo.list();
        const index = evaluations.findIndex((e) => e.classId === classId && e.studentId === studentId && e.meta === meta);
        const timestamp = now();
        const oldStatus = index >= 0 ? evaluations[index].status : null;
        const next = {
            classId,
            studentId,
            meta,
            status,
            updatedAt: timestamp
        };
        const updated = [...evaluations];
        if (index >= 0) {
            updated[index] = next;
        }
        else {
            updated.push(next);
        }
        await evaluationsRepo.saveAll(updated);
        const events = await outboxRepo.list();
        const event = {
            id: uuid(),
            studentId,
            classId,
            meta,
            oldStatus,
            newStatus: status,
            changedAt: timestamp,
            sentAt: null
        };
        await outboxRepo.saveAll([...events, event]);
        return next;
    }
};
