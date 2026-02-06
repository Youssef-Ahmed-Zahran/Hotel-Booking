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
} from "../controllers/booking.controller.js";
import {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Booking creation routes
router.post("/apartment", createApartmentBooking);
router.post("/room", createRoomBooking);

// Booking management routes
router.get("/", verifyTokenAndAuthorization, getAllBookings);
router.get("/:id", verifyTokenAndAuthorization, getBookingById);
router.patch("/:id/status", verifyTokenAndAdmin, updateBookingStatus);
router.delete("/:id", verifyTokenAndAuthorization, cancelBooking);

// User and hotel specific routes
router.get("/users/:userId/bookings", getUserBookings);
router.get("/hotels/:hotelId/bookings", verifyTokenAndAdmin, getHotelBookings);

export default router;
