import type { MetaKey, StatusValue } from "./constants.js";

export interface Student {
  id: string;
  name: string;
  cpf: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassEntity {
  id: string;
  topic: string;
  year: number;
  semester: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  classId: string;
  studentId: string;
  createdAt: string;
}

export interface Evaluation {
  classId: string;
  studentId: string;
  meta: MetaKey;
  status: StatusValue;
  updatedAt: string;
}

export interface EvaluationChangeEvent {
  id: string;
  studentId: string;
  classId: string;
  meta: MetaKey;
  oldStatus: StatusValue | null;
  newStatus: StatusValue;
  changedAt: string;
  sentAt: string | null;
}
