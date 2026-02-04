import prisma from "../../../config/db.js";

// Import generic handlers
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Create or update apartment availability for specific dates
 * @route   POST /api/apartment-availability
 * @access  Admin
 */
export const setApartmentAvailability = async (req, res, next) => {
  try {
    const { apartmentId, date, isAvailable } = req.body;

    if (!apartmentId || !date) {
      throw new ApiError(400, "Please provide apartmentId and date");
    }

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      throw new ApiError(404, "Apartment not found");
    }

    const availabilityDate = new Date(date);

    // Upsert availability record
    const availability = await prisma.apartmentAvailability.upsert({
      where: {
        apartmentId_date: {
          apartmentId,
          date: availabilityDate,
        },
      },
      update: {
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      create: {
        apartmentId,
        date: availabilityDate,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      include: {
        apartment: {
          select: {
            id: true,
            name: true,
            apartmentNumber: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          availability,
          "Apartment availability updated successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get apartment availability for a date range
 * @route   GET /api/apartment-availability/:apartmentId
 * @access  Public
 */
export const getApartmentAvailability = async (req, res, next) => {
  try {
    const { apartmentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ApiError(400, "Please provide startDate and endDate");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const availability = await prisma.apartmentAvailability.findMany({
      where: {
        apartmentId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          availability,
          "Apartment availability fetched successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk set apartment availability
 * @route   POST /api/apartment-availability/bulk
 * @access  Admin
 */
export const bulkSetApartmentAvailability = async (req, res, next) => {
  try {
    const { apartmentId, startDate, endDate, isAvailable } = req.body;

    if (!apartmentId || !startDate || !endDate) {
      throw new ApiError(
        400,
        "Please provide apartmentId, startDate, and endDate"
      );
    }

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      throw new ApiError(404, "Apartment not found");
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
        prisma.apartmentAvailability.upsert({
          where: {
            apartmentId_date: {
              apartmentId,
              date,
            },
          },
          update: {
            isAvailable: isAvailable !== undefined ? isAvailable : true,
          },
          create: {
            apartmentId,
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
        `Apartment availability set for ${dates.length} days`
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete apartment availability record
 * @route   DELETE /api/apartment-availability/:id
 * @access  Admin
 */
export const deleteApartmentAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const availability = await prisma.apartmentAvailability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new ApiError(404, "Availability record not found");
    }

    await prisma.apartmentAvailability.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Availability record deleted successfully")
      );
  } catch (error) {
    next(error);
  }
};
