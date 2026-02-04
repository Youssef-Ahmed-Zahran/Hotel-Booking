import express from "express";
import {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getHotelStats,
} from "../controllers/hotel.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllHotels);
router.get("/:id", getHotelById);

// Admin routes
router.post("/", verifyTokenAndAdmin, createHotel);
router.put("/:id", verifyTokenAndAdmin, updateHotel);
router.delete("/:id", verifyTokenAndAdmin, deleteHotel);
router.get("/:id/stats", verifyTokenAndAdmin, getHotelStats);

export default router;
