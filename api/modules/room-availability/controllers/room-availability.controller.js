import prisma from "../../../config/db.js";

// Import generic handlers
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Create or update room availability for specific dates
 * @route   POST /api/room-availability
 * @access  Admin
 */
export const setRoomAvailability = async (req, res, next) => {
  try {
    const { roomId, date, isAvailable } = req.body;

    if (!roomId || !date) {
      throw new ApiError(400, "Please provide roomId and date");
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    const availabilityDate = new Date(date);

    // Upsert availability record
    const availability = await prisma.roomAvailability.upsert({
      where: {
        roomId_date: {
          roomId,
          date: availabilityDate,
        },
      },
      update: {
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      create: {
        roomId,
        date: availabilityDate,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: true,
          },
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(200, availability, "Room availability updated successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get room availability for a date range
 * @route   GET /api/room-availability/:roomId
 * @access  Public
 */
export const getRoomAvailability = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ApiError(400, "Please provide startDate and endDate");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const availability = await prisma.roomAvailability.findMany({
      where: {
        roomId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return res.status(200).json(
      new ApiResponse(200, availability, "Room availability fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk set room availability
 * @route   POST /api/room-availability/bulk
 * @access  Admin
 */
export const bulkSetRoomAvailability = async (req, res, next) => {
  try {
    const { roomId, startDate, endDate, isAvailable } = req.body;

    if (!roomId || !startDate || !endDate) {
      throw new ApiError(400, "Please provide roomId, startDate, and endDate");
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate all dates in range
    const dates = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create availability records for all dates
    const availabilityRecords = await Promise.all(
      dates.map((date) =>
        prisma.roomAvailability.upsert({
          where: {
            roomId_date: {
              roomId,
              date,
            },
          },
          update: {
            isAvailable: isAvailable !== undefined ? isAvailable : true,
          },
          create: {
            roomId,
            date,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
          },
        })
      )
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          count: availabilityRecords.length,
          startDate: start,
          endDate: end,
        },
        `Room availability set for ${dates.length} days`
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete room availability record
 * @route   DELETE /api/room-availability/:id
 * @access  Admin
 */
export const deleteRoomAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const availability = await prisma.roomAvailability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new ApiError(404, "Availability record not found");
    }

    await prisma.roomAvailability.delete({
      where: { id },
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Availability record deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};
