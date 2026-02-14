import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getCurrentUser,
  getGlobalUserStats,
} from "../controllers/user.controller.js";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// User routes (protected)
router.get("/me", verifyToken, getCurrentUser);
router.post("/change-password", verifyToken, changePassword);
router.get("/:id", verifyToken, getUserById);
router.put("/:id", verifyTokenAndAuthorization, updateUser);

// Admin routes
router.get("/stats", verifyTokenAndAdmin, getGlobalUserStats);
router.get("/", verifyTokenAndAdmin, getAllUsers);
router.delete("/:id", verifyTokenAndAdmin, deleteUser);

export default router;
