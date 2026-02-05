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

const router = express.Router();

// Booking creation routes
router.post("/apartment", createApartmentBooking);
router.post("/room", createRoomBooking);

// Booking management routes
router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.patch("/:id/status", updateBookingStatus);
router.delete("/:id", cancelBooking);

// User and hotel specific routes
router.get("/users/:userId/bookings", getUserBookings);
router.get("/hotels/:hotelId/bookings", getHotelBookings);

export default router;
