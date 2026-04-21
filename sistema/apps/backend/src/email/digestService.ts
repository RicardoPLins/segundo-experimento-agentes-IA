import { DateTime } from "luxon";
import { DEFAULT_TIMEZONE } from "../constants.js";
import { outboxRepo } from "../repositories/outboxRepo.js";
import { studentsRepo } from "../repositories/studentsRepo.js";
import { classesRepo } from "../repositories/classesRepo.js";
import { EvaluationChangeEvent } from "../types.js";
import { ValidationError } from "../errors.js";

export interface DigestEmail {
  to: string;
  subject: string;
  body: string;
}

export interface DigestResult {
  sent: DigestEmail[];
  skipped: number;
}

const formatDay = (iso: string, timezone: string) =>
  DateTime.fromISO(iso, { zone: timezone }).toISODate();

const formatChangeLine = (event: EvaluationChangeEvent, classMap: Map<string, string>) => {
  const className = classMap.get(event.classId) ?? event.classId;
  const from = event.oldStatus ?? "(none)";
  return `• ${className} — ${event.meta}: ${from} → ${event.newStatus}`;
};

export const digestService = {
  async runDailyDigest(timezone = DEFAULT_TIMEZONE): Promise<DigestResult> {
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
    const grouped = new Map<string, EvaluationChangeEvent[]>();

    for (const event of unsent) {
      const day = formatDay(event.changedAt, timezone);
      const key = `${event.studentId}:${day}`;
      const list = grouped.get(key) ?? [];
      list.push(event);
      grouped.set(key, list);
    }

    const sentEmails: DigestEmail[] = [];
    const updatedEvents = events.map((e) => ({ ...e }));

    for (const [key, group] of grouped.entries()) {
      const [studentId] = key.split(":");
      const student = studentMap.get(studentId);
      if (!student) {
        continue;
      }
      const bodyLines = group.map((event) => formatChangeLine(event, classMap));
      const email: DigestEmail = {
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

  async runStudentDigest({
    studentId,
    classId,
    timezone = DEFAULT_TIMEZONE
  }: {
    studentId: string;
    classId?: string;
    timezone?: string;
  }): Promise<DigestResult> {
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

    const unsent = events.filter(
      (e) =>
        !e.sentAt &&
        e.studentId === studentId &&
        (!classId || e.classId === classId)
    );

    if (unsent.length === 0) {
      return { sent: [], skipped: 0 };
    }

    const grouped = new Map<string, EvaluationChangeEvent[]>();
    for (const event of unsent) {
      const day = formatDay(event.changedAt, timezone);
      const key = `${event.studentId}:${day}`;
      const list = grouped.get(key) ?? [];
      list.push(event);
      grouped.set(key, list);
    }

    const sentEmails: DigestEmail[] = [];
    const updatedEvents = events.map((e) => ({ ...e }));

    for (const group of grouped.values()) {
      const bodyLines = group.map((event) => formatChangeLine(event, classMap));
      const email: DigestEmail = {
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
  }
};
