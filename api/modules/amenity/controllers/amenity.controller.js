import prisma from "../../../config/db.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

// @desc    Create a new amenity
// @route   POST /api/amenities
// @access  Admin
export const createAmenity = async (req, res, next) => {
  try {
    const { name, description, roomId } = req.body;

    if (!name || !roomId) {
      throw new ApiError(400, "Name and Room ID are required");
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    // Check if amenity already exists for this room
    const existingAmenity = await prisma.amenity.findUnique({
      where: {
        roomId_name: {
          roomId,
          name,
        },
      },
    });

    if (existingAmenity) {
      throw new ApiError(400, "Amenity already exists for this room");
    }

    const amenity = await prisma.amenity.create({
      data: {
        name,
        description,
        roomId,
      },
    });

    res
      .status(201)
      .json(new ApiResponse(201, amenity, "Amenity created successfully"));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all amenities for a room
// @route   GET /api/amenities/room/:roomId
// @access  Public
export const getAmenities = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;

    if (!roomId) {
      throw new ApiError(400, "Room ID is required");
    }

    const amenities = await prisma.amenity.findMany({
      where: { roomId },
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
