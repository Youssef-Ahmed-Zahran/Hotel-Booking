import express from "express";
import {
  createApartment,
  getAllApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
  checkApartmentAvailability,
  getApartmentsByHotel,
} from "../controllers/apartment.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllApartments);
router.get("/hotel/:hotelId", getApartmentsByHotel);
router.get("/:id/availability", checkApartmentAvailability);
router.get("/:id", getApartmentById);

// Admin routes
router.post("/", verifyTokenAndAdmin, createApartment);
router.put("/:id", verifyTokenAndAdmin, updateApartment);
router.delete("/:id", verifyTokenAndAdmin, deleteApartment);

export default router;
