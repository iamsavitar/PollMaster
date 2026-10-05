import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe, refreshToken } from "../controllers/authController.js";
import { checkErrors } from "../middleware/validateRequest.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.post("/register", [body("name").trim().notEmpty(), body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 4 })], checkErrors, register);
router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").notEmpty()], checkErrors, login);
router.get("/me", protect, getMe);
router.post("/refresh", protect, refreshToken);
export default router;
