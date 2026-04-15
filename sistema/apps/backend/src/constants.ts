export const META_KEYS = [
  "requisitos",
  "testes",
  "backend",
  "frontend",
  "security"
] as const;

export const STATUS_VALUES = ["NONE", "MPA", "MA"] as const;

export const DEFAULT_TIMEZONE = "America/Recife";

export type MetaKey = (typeof META_KEYS)[number];
export type StatusValue = (typeof STATUS_VALUES)[number];
