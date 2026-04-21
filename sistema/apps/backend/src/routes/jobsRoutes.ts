import { Router, type Request, type Response, type NextFunction } from "express";
import { digestService } from "../email/digestService.js";

export const jobsRoutes = Router();

jobsRoutes.post(
  "/send-daily-digests",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timezone = req.body?.timezone;
      const result = await digestService.runDailyDigest(timezone);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

jobsRoutes.post(
  "/send-student-digest",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId, classId, timezone } = req.body ?? {};
      const result = await digestService.runStudentEvaluationEmail({ studentId, classId, timezone });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
