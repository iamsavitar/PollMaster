import { Router } from "express";
import { body } from "express-validator";
import { getPolls, getPoll, createPoll, updatePoll, deletePoll } from "../controllers/pollController.js";
import { checkErrors } from "../middleware/validateRequest.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
const validatePoll = [body("question").trim().notEmpty(), body("options").isArray({ min: 2 }), body("options.*").trim().notEmpty()];
router.get("/", getPolls);
router.get("/:id", getPoll);
router.post("/", protect, validatePoll, checkErrors, createPoll);
router.put("/:id", protect, updatePoll);
router.delete("/:id", protect, deletePoll);
export default router;
