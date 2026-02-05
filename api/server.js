import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import prisma from "./config/db.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Import routes
import userRoutes from "./modules/user/routes/user.routes.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import hotelRoutes from "./modules/hotel/routes/hotel.routes.js";
import apartmentRoutes from "./modules/apartment/routes/apartment.routes.js";
import apartmentAvailabilityRoutes from "./modules/apartment-availability/routes/apartment-availability.routes.js";
import roomRoutes from "./modules/room/routes/room.routes.js";
import roomAvailabilityRoutes from "./modules/room-availability/routes/room-availability.routes.js";
import reviewRoutes from "./modules/review/routes/review.routes.js";
import bookingRoutes from "./modules/booking/routes/booking.routes.js";
import amenityRoutes from "./modules/amenity/routes/amenity.routes.js";

// Express Usages
dotenv.config();

// Init App
const app = express();

//Apply Middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
};
app.use(cors(corsOptions));

// Database Config
app.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: "Server and database connected successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Database connection failed", details: error.message });
  }
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/apartment-availability", apartmentAvailabilityRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/room-availability", roomAvailabilityRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/amenities", amenityRoutes);

// PayPal
app.get("/api/v1/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Error Handler
app.use(errorHandler);

// Running the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
