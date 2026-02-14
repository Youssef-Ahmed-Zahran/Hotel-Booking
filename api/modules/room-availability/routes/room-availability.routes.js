import express from "express";
import {
  setRoomAvailability,
  getRoomAvailability,
  bulkSetRoomAvailability,
  deleteRoomAvailability,
  getGlobalRoomAvailabilityStats,
} from "../controllers/room-availability.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/stats", verifyTokenAndAdmin, getGlobalRoomAvailabilityStats);
router.get("/:roomId", getRoomAvailability);

// Admin routes
router.post("/", verifyTokenAndAdmin, setRoomAvailability);
router.post("/bulk", verifyTokenAndAdmin, bulkSetRoomAvailability);
router.delete("/:id", verifyTokenAndAdmin, deleteRoomAvailability);

export default router;
