import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { studentsRoutes } from "./routes/studentsRoutes.js";
import { classesRoutes } from "./routes/classesRoutes.js";
import { evaluationsRoutes } from "./routes/evaluationsRoutes.js";
import { jobsRoutes } from "./routes/jobsRoutes.js";
import { ConflictError, NotFoundError, ValidationError } from "./errors.js";

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/students", studentsRoutes);
  app.use("/classes", classesRoutes);
  app.use("/classes/:id/evaluations", evaluationsRoutes);
  app.use("/jobs", jobsRoutes);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as ValidationError | NotFoundError | ConflictError).status ?? 500;
    res.status(status).json({ message: err.message ?? "Unexpected error" });
  });

  return app;
};
