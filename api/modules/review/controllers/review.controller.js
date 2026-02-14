import prisma from "../../../config/db.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  User
 */
export const createReview = async (req, res, next) => {
  try {
    const {
      hotelId,
      apartmentId,
      roomId,
      bookingId,
      rating,
      comment,
      reviewType,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!hotelId || !rating || !reviewType) {
      throw new ApiError(400, "Please provide hotelId, rating, and reviewType");
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Validate reviewType
    if (!["HOTEL", "APARTMENT", "ROOM"].includes(reviewType)) {
      throw new ApiError(400, "Invalid review type");
    }

    // If booking is provided, verify it exists and belongs to user
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new ApiError(404, "Booking not found");
      }

      if (booking.userId !== userId) {
        throw new ApiError(403, "You can only review your own bookings");
      }

      // Check if review already exists for this booking
      const existingReview = await prisma.review.findUnique({
        where: { bookingId },
      });

      if (existingReview) {
        throw new ApiError(400, "Review already exists for this booking");
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        hotelId,
        apartmentId,
        roomId,
        bookingId,
        rating,
        comment,
        reviewType,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        apartment: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, review, "Review created successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  Public
 */
export const getAllReviews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      hotelId,
      apartmentId,
      roomId,
      userId,
      reviewType,
      minRating,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter object
    const where = {};
    if (hotelId) where.hotelId = hotelId;
    if (apartmentId) where.apartmentId = apartmentId;
    if (roomId) where.roomId = roomId;
    if (userId) where.userId = userId;
    if (reviewType) where.reviewType = reviewType;
    if (minRating) where.rating = { gte: parseInt(minRating) };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          hotel: {
            select: {
              id: true,
              name: true,
            },
          },
          apartment: {
            select: {
              id: true,
              name: true,
              apartmentNumber: true,
            },
          },
          room: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          reviews,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Reviews fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review by ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        hotel: true,
        apartment: true,
        room: true,
        booking: true,
      },
    });

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, review, "Review fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  User
 */
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new ApiError(404, "Review not found");
    }

    // Authorization check: Only the owner or an admin can update the review
    if (existingReview.userId !== req.user.id && req.user.role !== "ADMIN") {
      throw new ApiError(
        403,
        "Forbidden - You can only update your own reviews"
      );
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        hotel: true,
        apartment: true,
        room: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, review, "Review updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  User/Admin
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    // Authorization check: Only the owner or an admin can delete the review
    if (review.userId !== req.user.id && req.user.role !== "ADMIN") {
      throw new ApiError(
        403,
        "Forbidden - You can only delete your own reviews"
      );
    }

    await prisma.review.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Review deleted successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews by hotel
 * @route   GET /api/hotels/:hotelId/reviews
 * @access  Public
 */
export const getReviewsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { hotelId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          reviews,
          averageRating: avgRating.toFixed(2),
          totalReviews: reviews.length,
        },
        "Hotel reviews fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
