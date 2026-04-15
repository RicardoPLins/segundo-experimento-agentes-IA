import { Router } from "express";
import { classesService } from "../services/classesService.js";
import { enrollmentsService } from "../services/enrollmentsService.js";
import { studentsService } from "../services/studentsService.js";
export const classesRoutes = Router();
classesRoutes.get("/", async (_req, res, next) => {
    try {
        const classes = await classesService.list();
        res.json(classes);
    }
    catch (error) {
        next(error);
    }
});
classesRoutes.post("/", async (req, res, next) => {
    try {
        const entity = await classesService.create(req.body);
        res.status(201).json(entity);
    }
    catch (error) {
        next(error);
    }
});
classesRoutes.get("/:id", async (req, res, next) => {
    try {
        const entity = await classesService.getById(req.params.id);
        res.json(entity);
    }
    catch (error) {
        next(error);
    }
});
classesRoutes.put("/:id", async (req, res, next) => {
    try {
        const entity = await classesService.update(req.params.id, req.body);
        res.json(entity);
    }
    catch (error) {
        next(error);
    }
});
classesRoutes.delete("/:id", async (req, res, next) => {
    try {
        await classesService.remove(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
classesRoutes.get("/:id/students", async (req, res, next) => {
    try {
        const enrollments = await enrollmentsService.listByClass(req.params.id);
        const students = await studentsService.list();
        const roster = enrollments
            .map((e) => students.find((s) => s.id === e.studentId))
            .filter(Boolean);
        res.json(roster);
    }
    catch (error) {
        next(error);
    }
});
classesRoutes.post("/:id/students/:studentId", async (req, res, next) => {
    try {
        await enrollmentsService.enroll(req.params.id, req.params.studentId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
classesRoutes.delete("/:id/students/:studentId", async (req, res, next) => {
    try {
        await enrollmentsService.unenroll(req.params.id, req.params.studentId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
