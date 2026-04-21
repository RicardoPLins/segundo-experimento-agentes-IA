import { DateTime } from "luxon";
import nodemailer from "nodemailer";
import { DEFAULT_TIMEZONE } from "../constants.js";
import { outboxRepo } from "../repositories/outboxRepo.js";
import { studentsRepo } from "../repositories/studentsRepo.js";
import { classesRepo } from "../repositories/classesRepo.js";
import { evaluationsRepo } from "../repositories/evaluationsRepo.js";
import { ValidationError } from "../errors.js";
import { META_KEYS } from "../constants.js";
const formatDay = (iso, timezone) => DateTime.fromISO(iso, { zone: timezone }).toISODate();
const formatChangeLine = (event, classMap) => {
    const className = classMap.get(event.classId) ?? event.classId;
    const from = event.oldStatus ?? "(none)";
    return `• ${className} — ${event.meta}: ${from} → ${event.newStatus}`;
};
let cachedTransporter = null;
const MAILDEV_HOST = "localhost";
const MAILDEV_PORT = 1025;
const MAILDEV_FROM = "Web Scholar <no-reply@webscholar.local>";
const getTransporter = async () => {
    if (cachedTransporter) {
        return { transporter: cachedTransporter, from: MAILDEV_FROM };
    }
    const transporter = nodemailer.createTransport({
        host: MAILDEV_HOST,
        port: MAILDEV_PORT,
        secure: false
    });
    cachedTransporter = transporter;
    return { transporter, from: MAILDEV_FROM };
};
export const digestService = {
    async runDailyDigest(timezone = DEFAULT_TIMEZONE) {
        if (!timezone) {
            throw new ValidationError("timezone is required");
        }
        const [events, students, classes] = await Promise.all([
            outboxRepo.list(),
            studentsRepo.list(),
            classesRepo.list()
        ]);
        const classMap = new Map(classes.map((c) => [c.id, c.topic]));
        const studentMap = new Map(students.map((s) => [s.id, s]));
        const unsent = events.filter((e) => !e.sentAt);
        const grouped = new Map();
        for (const event of unsent) {
            const day = formatDay(event.changedAt, timezone);
            const key = `${event.studentId}:${day}`;
            const list = grouped.get(key) ?? [];
            list.push(event);
            grouped.set(key, list);
        }
        const sentEmails = [];
        const updatedEvents = events.map((e) => ({ ...e }));
        for (const [key, group] of grouped.entries()) {
            const [studentId] = key.split(":");
            const student = studentMap.get(studentId);
            if (!student) {
                continue;
            }
            const bodyLines = group.map((event) => formatChangeLine(event, classMap));
            const email = {
                to: student.email,
                subject: "Web Scholar — Atualizações de Avaliação",
                body: [
                    `Olá ${student.name},`,
                    "",
                    "Aqui estão as atualizações de avaliação do dia:",
                    ...bodyLines,
                    "",
                    "— Web Scholar"
                ].join("\n")
            };
            sentEmails.push(email);
            for (const event of group) {
                const idx = updatedEvents.findIndex((e) => e.id === event.id);
                if (idx >= 0) {
                    updatedEvents[idx] = { ...updatedEvents[idx], sentAt: DateTime.utc().toISO() };
                }
            }
        }
        await outboxRepo.saveAll(updatedEvents);
        return { sent: sentEmails, skipped: unsent.length - sentEmails.length };
    },
    async runStudentDigest({ studentId, classId, timezone = DEFAULT_TIMEZONE }) {
        if (!studentId) {
            throw new ValidationError("studentId is required");
        }
        if (!timezone) {
            throw new ValidationError("timezone is required");
        }
        const [events, students, classes] = await Promise.all([
            outboxRepo.list(),
            studentsRepo.list(),
            classesRepo.list()
        ]);
        const student = students.find((s) => s.id === studentId);
        if (!student) {
            throw new ValidationError("student not found");
        }
        const classMap = new Map(classes.map((c) => [c.id, c.topic]));
        const unsent = events.filter((e) => !e.sentAt &&
            e.studentId === studentId &&
            (!classId || e.classId === classId));
        if (unsent.length === 0) {
            return { sent: [], skipped: 0 };
        }
        const grouped = new Map();
        for (const event of unsent) {
            const day = formatDay(event.changedAt, timezone);
            const key = `${event.studentId}:${day}`;
            const list = grouped.get(key) ?? [];
            list.push(event);
            grouped.set(key, list);
        }
        const sentEmails = [];
        const updatedEvents = events.map((e) => ({ ...e }));
        for (const group of grouped.values()) {
            const bodyLines = group.map((event) => formatChangeLine(event, classMap));
            const email = {
                to: student.email,
                subject: "Web Scholar — Atualizações de Avaliação",
                body: [
                    `Olá ${student.name},`,
                    "",
                    "Aqui estão as atualizações de avaliação do dia:",
                    ...bodyLines,
                    "",
                    "— Web Scholar"
                ].join("\n")
            };
            sentEmails.push(email);
            for (const event of group) {
                const idx = updatedEvents.findIndex((e) => e.id === event.id);
                if (idx >= 0) {
                    updatedEvents[idx] = { ...updatedEvents[idx], sentAt: DateTime.utc().toISO() };
                }
            }
        }
        await outboxRepo.saveAll(updatedEvents);
        return { sent: sentEmails, skipped: unsent.length - sentEmails.length };
    },
    async runStudentEvaluationEmail({ studentId, classId, timezone = DEFAULT_TIMEZONE }) {
        if (!studentId) {
            throw new ValidationError("studentId is required");
        }
        if (!classId) {
            throw new ValidationError("classId is required");
        }
        const [students, classes, evaluations] = await Promise.all([
            studentsRepo.list(),
            classesRepo.list(),
            evaluationsRepo.list()
        ]);
        const student = students.find((s) => s.id === studentId);
        if (!student) {
            throw new ValidationError("student not found");
        }
        const classEntity = classes.find((c) => c.id === classId);
        if (!classEntity) {
            throw new ValidationError("class not found");
        }
        const classEvals = evaluations.filter((e) => e.classId === classId && e.studentId === studentId);
        const statusMap = META_KEYS.reduce((acc, meta) => {
            const evaluation = classEvals.find((e) => e.meta === meta);
            acc[meta] = evaluation?.status ?? "NONE";
            return acc;
        }, {});
        if (META_KEYS.some((meta) => statusMap[meta] === "NONE")) {
            throw new ValidationError("All evaluation metas must be filled before sending.");
        }
        const bodyLines = META_KEYS.map((meta) => `• ${meta}: ${statusMap[meta]}`);
        const email = {
            to: student.email,
            subject: "Web Scholar — Avaliação Final",
            body: [
                `Olá ${student.name},`,
                "",
                `Resumo das avaliações da turma ${classEntity.topic} (${classEntity.year}/${classEntity.semester}):`,
                ...bodyLines,
                "",
                `Enviado em ${DateTime.now().setZone(timezone).toFormat("dd/LL/yyyy HH:mm")}`,
                "",
                "— Web Scholar"
            ].join("\n")
        };
        const { transporter, from } = await getTransporter();
        await transporter.sendMail({
            from,
            to: email.to,
            subject: email.subject,
            text: email.body
        });
        return { sent: [email], skipped: 0 };
    }
};
