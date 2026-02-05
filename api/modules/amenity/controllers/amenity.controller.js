import prisma from "../../../config/db.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

// @desc    Create a new amenity
// @route   POST /api/amenities
// @access  Admin (or related Hotel Admin)
export const createAmenity = async (req, res, next) => {
  try {
    const { name, description, hotelId } = req.body;

    if (!name || !hotelId) {
      throw new ApiError(400, "Name and Hotel ID are required");
    }

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // Check if amenity already exists for this hotel
    const existingAmenity = await prisma.amenity.findUnique({
      where: {
        hotelId_name: {
          hotelId,
          name,
        },
      },
    });

    if (existingAmenity) {
      throw new ApiError(400, "Amenity already exists for this hotel");
    }

    const amenity = await prisma.amenity.create({
      data: {
        name,
        description,
        hotelId,
      },
    });

    res
      .status(201)
      .json(new ApiResponse(201, amenity, "Amenity created successfully"));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all amenities for a hotel
// @route   GET /api/amenities/:id
// @access  Public
export const getAmenities = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId;

    if (!hotelId) {
      throw new ApiError(400, "Hotel ID is required");
    }

    const amenities = await prisma.amenity.findMany({
      where: { hotelId },
      orderBy: { name: "asc" },
    });

    res
      .status(200)
      .json(new ApiResponse(200, amenities, "Amenities fetched successfully"));
  } catch (error) {
    next(error);
  }
};

// @desc    Update an amenity
// @route   PUT /api/amenities/:id
// @access  Admin
export const updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const amenity = await prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenity) {
      throw new ApiError(404, "Amenity not found");
    }

    const updatedAmenity = await prisma.amenity.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res
      .status(200)
      .json(new ApiResponse(200, updatedAmenity, "Amenity updated successfully"));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an amenity
// @route   DELETE /api/amenities/:id
// @access  Admin
export const deleteAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const amenity = await prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenity) {
      throw new ApiError(404, "Amenity not found");
    }

    await prisma.amenity.delete({
      where: { id },
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Amenity deleted successfully"));
  } catch (error) {
    next(error);
  }
};
