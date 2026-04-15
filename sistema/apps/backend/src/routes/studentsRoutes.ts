import { Router, type NextFunction, type Request, type Response } from "express";
import { studentsService } from "../services/studentsService.js";

export const studentsRoutes = Router();

studentsRoutes.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await studentsService.list();
    res.json(students);
  } catch (error) {
    next(error);
  }
});

studentsRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await studentsService.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
});

studentsRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await studentsService.getById(req.params.id);
    res.json(student);
  } catch (error) {
    next(error);
  }
});

studentsRoutes.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await studentsService.update(req.params.id, req.body);
    res.json(student);
  } catch (error) {
    next(error);
  }
});

studentsRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await studentsService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
