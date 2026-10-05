import { Router } from "express";
import { getPollResults, getPollChart } from "../controllers/analyticsController.js";

const router = Router();
router.get("/poll/:id", getPollResults);
router.get("/chart/:id", getPollChart);
export default router;
