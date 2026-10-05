import { Router } from "express";
import { body } from "express-validator";
import { submitVote, getMyVotes, getPollVoteCount } from "../controllers/responseController.js";
import { checkErrors } from "../middleware/validateRequest.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, [body("pollId").isMongoId(), body("optionIndex").isInt({ min: 0 })], checkErrors, submitVote);
router.get("/", protect, getMyVotes);
router.get("/poll/:id", getPollVoteCount);
export default router;
