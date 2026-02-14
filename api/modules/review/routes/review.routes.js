import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByHotel,
} from "../controllers/review.controller.js";
import {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllReviews);
router.get("/hotel/:hotelId", getReviewsByHotel);
router.get("/:id", getReviewById);

// User routes
router.post("/", verifyToken, createReview);
router.put("/:id", verifyToken, updateReview);
router.delete("/:id", verifyToken, deleteReview);

export default router;
