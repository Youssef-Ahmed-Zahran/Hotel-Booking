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
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} from "../../../middlewares/verifyToken.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllReviews);
router.get("/hotel/:hotelId", getReviewsByHotel);
router.get("/:id", getReviewById);

// User routes
router.post("/", verifyTokenAndAdmin, createReview);
router.put("/:id", verifyTokenAndAdmin, updateReview);
router.delete("/:id", verifyTokenAndAuthorization, deleteReview);

export default router;
