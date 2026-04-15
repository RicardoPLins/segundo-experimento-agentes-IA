import { Router } from "express";
import { digestService } from "../email/digestService.js";
export const jobsRoutes = Router();
jobsRoutes.post("/send-daily-digests", async (req, res, next) => {
    try {
        const timezone = req.body?.timezone;
        const result = await digestService.runDailyDigest(timezone);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
