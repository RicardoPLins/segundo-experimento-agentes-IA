import { v4 as uuid } from "uuid";
import { DateTime } from "luxon";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import type { Student } from "../types.js";
import { studentsRepo } from "../repositories/studentsRepo.js";
import { enrollmentsRepo } from "../repositories/enrollmentsRepo.js";

const now = () => DateTime.utc().toISO();
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const studentsService = {
  async list(): Promise<Student[]> {
    return studentsRepo.list();
  },

  async create(input: Pick<Student, "name" | "cpf" | "email">): Promise<Student> {
    if (!input.name || !input.cpf || !input.email) {
      throw new ValidationError("Name, CPF, and email are required.");
    }
    if (!CPF_REGEX.test(input.cpf)) {
      throw new ValidationError("CPF must match 000.000.000-00.");
    }
    if (!EMAIL_REGEX.test(input.email)) {
      throw new ValidationError("Email must be a valid address.");
    }
    const students = await studentsRepo.list();
    if (students.some((s) => s.cpf === input.cpf)) {
      throw new ConflictError("CPF is already registered.");
    }
    if (students.some((s) => s.email === input.email)) {
      throw new ConflictError("Email is already registered.");
    }
    const timestamp = now();
    const student: Student = {
      id: uuid(),
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await studentsRepo.saveAll([...students, student]);
    return student;
  },

  async getById(id: string): Promise<Student> {
    const students = await studentsRepo.list();
    const student = students.find((s) => s.id === id);
    if (!student) {
      throw new NotFoundError("student not found");
    }
    return student;
  },

  async update(id: string, input: Partial<Pick<Student, "name" | "cpf" | "email">>): Promise<Student> {
    const students = await studentsRepo.list();
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundError("student not found");
    }
    const current = students[index];
    const next: Student = {
      ...current,
      name: input.name ?? current.name,
      cpf: input.cpf ?? current.cpf,
      email: input.email ?? current.email,
      updatedAt: now()
    };
    if (!next.name || !next.cpf || !next.email) {
      throw new ValidationError("Name, CPF, and email are required.");
    }
    if (!CPF_REGEX.test(next.cpf)) {
      throw new ValidationError("CPF must match 000.000.000-00.");
    }
    if (!EMAIL_REGEX.test(next.email)) {
      throw new ValidationError("Email must be a valid address.");
    }
    if (students.some((s) => s.id !== id && s.cpf === next.cpf)) {
      throw new ConflictError("CPF is already registered.");
    }
    if (students.some((s) => s.id !== id && s.email === next.email)) {
      throw new ConflictError("Email is already registered.");
    }
    const updated = [...students];
    updated[index] = next;
    await studentsRepo.saveAll(updated);
    return next;
  },

  async remove(id: string): Promise<void> {
    const students = await studentsRepo.list();
    const student = students.find((s) => s.id === id);
    if (!student) {
      throw new NotFoundError("student not found");
    }
    const enrollments = await enrollmentsRepo.list();
    if (enrollments.some((e) => e.studentId === id)) {
      throw new ConflictError("student has enrollments");
    }
    await studentsRepo.saveAll(students.filter((s) => s.id !== id));
  }
};
