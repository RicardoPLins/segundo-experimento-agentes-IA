import { DateTime } from "luxon";
import sgMail from "@sendgrid/mail";
import { DEFAULT_TIMEZONE } from "../constants.js";
import { outboxRepo } from "../repositories/outboxRepo.js";
import { studentsRepo } from "../repositories/studentsRepo.js";
import { classesRepo } from "../repositories/classesRepo.js";
import { evaluationsRepo } from "../repositories/evaluationsRepo.js";
import { EvaluationChangeEvent } from "../types.js";
import { ValidationError } from "../errors.js";
import { META_KEYS } from "../constants.js";

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

let sendGridConfigured = false;

const configureSendGrid = () => {
  if (sendGridConfigured) {
    return;
  }
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new ValidationError("SENDGRID_API_KEY is required to send emails.");
  }
  sgMail.setApiKey(apiKey);
  sendGridConfigured = true;
};

const getSendGridFrom = () => {
  const from = process.env.SENDGRID_FROM;
  if (!from) {
    throw new ValidationError("SENDGRID_FROM is required to send emails.");
  }
  return from;
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
  },

  async runStudentEvaluationEmail({
    studentId,
    classId,
    timezone = DEFAULT_TIMEZONE
  }: {
    studentId: string;
    classId: string;
    timezone?: string;
  }): Promise<DigestResult> {
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

    const classEvals = evaluations.filter(
      (e) => e.classId === classId && e.studentId === studentId
    );

    const statusMap = META_KEYS.reduce<Record<string, string>>((acc, meta) => {
      const evaluation = classEvals.find((e) => e.meta === meta);
      acc[meta] = evaluation?.status ?? "NONE";
      return acc;
    }, {});

    if (META_KEYS.some((meta) => statusMap[meta] === "NONE")) {
      throw new ValidationError("All evaluation metas must be filled before sending.");
    }

    const bodyLines = META_KEYS.map((meta) => `• ${meta}: ${statusMap[meta]}`);
    const email: DigestEmail = {
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

    configureSendGrid();
    await sgMail.send({
      from: getSendGridFrom(),
      to: email.to,
      subject: email.subject,
      text: email.body
    });

    return { sent: [email], skipped: 0 };
  }
};
