import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Admin routes
router.get("/stats", verifyTokenAndAdmin, getDashboardStats);

export default router;
