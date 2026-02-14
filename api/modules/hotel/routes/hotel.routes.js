import express from "express";
import {
  createHotel,
  getAllHotels,
  getFeaturedHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getHotelStats,
  getGlobalHotelStats,
} from "../controllers/hotel.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllHotels);
router.get("/featured", getFeaturedHotels);
router.get("/:id", getHotelById);

// Admin routes
router.get("/stats", verifyTokenAndAdmin, getGlobalHotelStats);
router.post("/", verifyTokenAndAdmin, createHotel);
router.put("/:id", verifyTokenAndAdmin, updateHotel);
router.delete("/:id", verifyTokenAndAdmin, deleteHotel);
router.get("/:id/stats", verifyTokenAndAdmin, getHotelStats);

export default router;
