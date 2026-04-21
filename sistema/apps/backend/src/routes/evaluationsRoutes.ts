import { Router, type Request, type Response, type NextFunction } from "express";
import { evaluationsService } from "../services/evaluationsService.js";
import { enrollmentsService } from "../services/enrollmentsService.js";
import { studentsService } from "../services/studentsService.js";
import { META_KEYS } from "../constants.js";

export const evaluationsRoutes = Router({ mergeParams: true });

evaluationsRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classId = req.params.id;
    const enrollments = await enrollmentsService.listByClass(classId);
    const students = await studentsService.list();
    const evaluations = await evaluationsService.listByClass(classId);

    const rows = enrollments.map((enrollment) => {
      const student = students.find((s) => s.id === enrollment.studentId);
      const metas = META_KEYS.reduce<Record<string, string>>((acc, meta) => {
        const evaluation = evaluations.find(
          (e) => e.classId === classId && e.studentId === enrollment.studentId && e.meta === meta
        );
        acc[meta] = evaluation?.status ?? "NONE";
        return acc;
      }, {});
      return {
        studentId: enrollment.studentId,
        studentName: student?.name ?? "",
        studentEmail: student?.email ?? "",
        metas
      };
    });

    res.json({ classId, rows });
  } catch (error) {
    next(error);
  }
});

evaluationsRoutes.put(
  "/:studentId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = req.params.id;
      const studentId = req.params.studentId;
      const { meta, status } = req.body;
      const evaluation = await evaluationsService.update(classId, studentId, meta, status);
      res.json(evaluation);
    } catch (error) {
      next(error);
    }
  }
);
