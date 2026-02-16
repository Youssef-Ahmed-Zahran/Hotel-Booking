import express from "express";
import {
  createApartmentBooking,
  createRoomBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getUserBookings,
  getHotelBookings,
  checkAvailability,
  getGlobalBookingStats,
} from "../controllers/booking.controller.js";
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Booking creation routes
router.post("/apartment", verifyToken, createApartmentBooking);
router.post("/room", verifyToken, createRoomBooking);
router.post("/check-availability", checkAvailability);

// Booking management routes
router.get("/stats", verifyTokenAndAdmin, getGlobalBookingStats);
router.get("/", verifyTokenAndAuthorization, getAllBookings);
router.get("/:id", verifyTokenAndAuthorization, getBookingById);
router.patch("/:id/status", verifyTokenAndAdmin, updateBookingStatus);
router.delete("/:id", verifyToken, cancelBooking);

// User and hotel specific routes
router.get("/users/:userId/bookings", getUserBookings);
router.get("/hotels/:hotelId/bookings", verifyTokenAndAdmin, getHotelBookings);

export default router;
