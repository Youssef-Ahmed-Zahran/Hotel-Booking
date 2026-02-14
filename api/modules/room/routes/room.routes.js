import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
  getRoomsByApartment,
  getRoomsByHotel,
  getGlobalRoomStats,
} from "../controllers/room.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.get("/:id/availability", checkRoomAvailability);
router.get("/apartment/:apartmentId", getRoomsByApartment);
router.get("/hotel/:hotelId", getRoomsByHotel);

// Admin routes
router.get("/stats", verifyTokenAndAdmin, getGlobalRoomStats);
router.post("/", verifyTokenAndAdmin, createRoom);
router.put("/:id", verifyTokenAndAdmin, updateRoom);
router.delete("/:id", verifyTokenAndAdmin, deleteRoom);

export default router;
