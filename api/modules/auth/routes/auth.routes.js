import express from "express";
import {
    register,
    login,
    logout,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../../../middlewares/verifyToken.middleware.js";
import {
    loginLimiter,
    registerLimiter,
} from "../../../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

// Protected routes
router.post("/logout", verifyToken, logout);

export default router;
