import { Router } from "express";
import { studentsService } from "../services/studentsService.js";
export const studentsRoutes = Router();
studentsRoutes.get("/", async (_req, res, next) => {
    try {
        const students = await studentsService.list();
        res.json(students);
    }
    catch (error) {
        next(error);
    }
});
studentsRoutes.post("/", async (req, res, next) => {
    try {
        const student = await studentsService.create(req.body);
        res.status(201).json(student);
    }
    catch (error) {
        next(error);
    }
});
studentsRoutes.get("/:id", async (req, res, next) => {
    try {
        const student = await studentsService.getById(req.params.id);
        res.json(student);
    }
    catch (error) {
        next(error);
    }
});
studentsRoutes.put("/:id", async (req, res, next) => {
    try {
        const student = await studentsService.update(req.params.id, req.body);
        res.json(student);
    }
    catch (error) {
        next(error);
    }
});
studentsRoutes.delete("/:id", async (req, res, next) => {
    try {
        await studentsService.remove(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
