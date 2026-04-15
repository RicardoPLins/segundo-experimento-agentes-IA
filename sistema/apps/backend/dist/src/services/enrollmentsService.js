import { DateTime } from "luxon";
import { ConflictError, NotFoundError } from "../errors.js";
import { enrollmentsRepo } from "../repositories/enrollmentsRepo.js";
import { classesRepo } from "../repositories/classesRepo.js";
import { studentsRepo } from "../repositories/studentsRepo.js";
const now = () => DateTime.utc().toISO();
export const enrollmentsService = {
    async listByClass(classId) {
        const enrollments = await enrollmentsRepo.list();
        return enrollments.filter((e) => e.classId === classId);
    },
    async enroll(classId, studentId) {
        const classes = await classesRepo.list();
        if (!classes.some((c) => c.id === classId)) {
            throw new NotFoundError("class not found");
        }
        const students = await studentsRepo.list();
        if (!students.some((s) => s.id === studentId)) {
            throw new NotFoundError("student not found");
        }
        const enrollments = await enrollmentsRepo.list();
        if (enrollments.some((e) => e.classId === classId && e.studentId === studentId)) {
            throw new ConflictError("duplicate enrollment");
        }
        const next = {
            classId,
            studentId,
            createdAt: now()
        };
        await enrollmentsRepo.saveAll([...enrollments, next]);
    },
    async unenroll(classId, studentId) {
        const enrollments = await enrollmentsRepo.list();
        const exists = enrollments.some((e) => e.classId === classId && e.studentId === studentId);
        if (!exists) {
            throw new NotFoundError("enrollment not found");
        }
        await enrollmentsRepo.saveAll(enrollments.filter((e) => !(e.classId === classId && e.studentId === studentId)));
    }
};
