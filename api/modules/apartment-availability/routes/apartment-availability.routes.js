import express from "express";
import {
  setApartmentAvailability,
  getApartmentAvailability,
  bulkSetApartmentAvailability,
  deleteApartmentAvailability,
  getGlobalApartmentAvailabilityStats,
} from "../controllers/apartment-availability.controller.js";
import { verifyTokenAndAdmin } from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/stats", verifyTokenAndAdmin, getGlobalApartmentAvailabilityStats);
router.get("/:apartmentId", getApartmentAvailability);

// Admin routes
router.post("/", verifyTokenAndAdmin, setApartmentAvailability);
router.post("/bulk", verifyTokenAndAdmin, bulkSetApartmentAvailability);
router.delete("/:id", verifyTokenAndAdmin, deleteApartmentAvailability);

export default router;
