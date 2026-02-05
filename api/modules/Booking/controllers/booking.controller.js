import prisma from "../../../config/db.js";

// Import generic handlers
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Create apartment booking
 * @route   POST /api/bookings/apartment
 * @access  User
 */
export const createApartmentBooking = async (req, res, next) => {
  try {
    const {
      userId,
      hotelId,
      apartmentId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      paymentAmount,
      paymentCurrency,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !hotelId ||
      !apartmentId ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfGuests ||
      !paymentAmount ||
      !paymentMethod
    ) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (checkIn >= checkOut) {
      throw new ApiError(400, "Check-out date must be after check-in date");
    }

    if (checkIn < new Date()) {
      throw new ApiError(400, "Check-in date cannot be in the past");
    }

    // Check if apartment exists and is available
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        rooms: true,
      },
    });

    if (!apartment) {
      throw new ApiError(404, "Apartment not found");
    }

    if (!apartment.isAvailable) {
      throw new ApiError(400, "Apartment is not available for booking");
    }

    // Check capacity
    if (numberOfGuests > apartment.totalCapacity) {
      throw new ApiError(
        400,
        `Apartment capacity is ${apartment.totalCapacity} guests`
      );
    }

    // CRITICAL: Check for conflicting bookings
    // 1. Check if apartment is already booked
    const apartmentBookings = await prisma.booking.findMany({
      where: {
        apartmentId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkOut } },
              { checkOutDate: { gte: checkIn } },
            ],
          },
        ],
      },
    });

    if (apartmentBookings.length > 0) {
      throw new ApiError(
        400,
        "Apartment is already booked for the selected dates"
      );
    }

    // 2. Check if any room in the apartment is booked
    const roomIds = apartment.rooms.map((room) => room.id);
    if (roomIds.length > 0) {
      const roomBookings = await prisma.booking.findMany({
        where: {
          roomId: {
            in: roomIds,
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          OR: [
            {
              AND: [
                { checkInDate: { lte: checkOut } },
                { checkOutDate: { gte: checkIn } },
              ],
            },
          ],
        },
      });

      if (roomBookings.length > 0) {
        throw new ApiError(
          400,
          "Cannot book apartment because some rooms are already booked"
        );
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        hotelId,
        apartmentId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests,
        bookingType: "APARTMENT",
        paymentAmount,
        paymentCurrency: paymentCurrency || "USD",
        paymentMethod,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        apartment: true,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, booking, "Apartment booked successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create room booking
 * @route   POST /api/bookings/room
 * @access  User
 */
export const createRoomBooking = async (req, res, next) => {
  try {
    const {
      userId,
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      paymentAmount,
      paymentCurrency,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !hotelId ||
      !roomId ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfGuests ||
      !paymentAmount ||
      !paymentMethod
    ) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (checkIn >= checkOut) {
      throw new ApiError(400, "Check-out date must be after check-in date");
    }

    if (checkIn < new Date()) {
      throw new ApiError(400, "Check-in date cannot be in the past");
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        apartment: true,
      },
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    if (!room.isAvailable) {
      throw new ApiError(400, "Room is not available for booking");
    }

    if (!room.bookableIndividually) {
      throw new ApiError(400, "This room cannot be booked individually");
    }

    // Check capacity
    if (numberOfGuests > room.capacity) {
      throw new ApiError(400, `Room capacity is ${room.capacity} guests`);
    }

    // CRITICAL: Check for conflicting bookings
    // 1. Check if room is already booked
    const roomBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkOut } },
              { checkOutDate: { gte: checkIn } },
            ],
          },
        ],
      },
    });

    if (roomBookings.length > 0) {
      throw new ApiError(400, "Room is already booked for the selected dates");
    }

    // 2. If room belongs to an apartment, check if apartment is booked
    if (room.apartmentId) {
      const apartmentBookings = await prisma.booking.findMany({
        where: {
          apartmentId: room.apartmentId,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          OR: [
            {
              AND: [
                { checkInDate: { lte: checkOut } },
                { checkOutDate: { gte: checkIn } },
              ],
            },
          ],
        },
      });

      if (apartmentBookings.length > 0) {
        throw new ApiError(
          400,
          "Cannot book room because the entire apartment is already booked"
        );
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        hotelId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests,
        bookingType: "ROOM",
        paymentAmount,
        paymentCurrency: paymentCurrency || "USD",
        paymentMethod,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        room: {
          include: {
            apartment: {
              select: {
                id: true,
                name: true,
                apartmentNumber: true,
              },
            },
          },
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, booking, "Room booked successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/bookings
 * @access  User/Admin
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      hotelId,
      status,
      bookingType,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter object
    const where = {};
    if (userId) where.userId = userId;
    if (hotelId) where.hotelId = hotelId;
    if (status) where.status = status;
    if (bookingType) where.bookingType = bookingType;

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
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
      prisma.booking.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          bookings,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Bookings fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  User/Admin
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
          },
        },
        hotel: true,
        apartment: true,
        room: {
          include: {
            apartment: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status
 * @route   PATCH /api/bookings/:id/status
 * @access  Admin
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status && !paymentStatus) {
      throw new ApiError(
        400,
        "Please provide status or paymentStatus to update"
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new ApiError(404, "Booking not found");
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "COMPLETED") {
        updateData.paymentCompletedAt = new Date();
      }
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        hotel: true,
        apartment: true,
        room: true,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, booking, "Booking status updated successfully")
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking
 * @route   DELETE /api/bookings/:id
 * @access  User/Admin
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new ApiError(400, "Booking is already cancelled");
    }

    if (booking.status === "COMPLETED") {
      throw new ApiError(400, "Cannot cancel a completed booking");
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedBooking, "Booking cancelled successfully")
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's bookings
 * @route   GET /api/users/:userId/bookings
 * @access  User
 */
export const getUserBookings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
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
            isAvailable: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, bookings, "User bookings fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get hotel bookings
 * @route   GET /api/hotels/:hotelId/bookings
 * @access  Admin
 */
export const getHotelBookings = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    const bookings = await prisma.booking.findMany({
      where: { hotelId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
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
            isAvailable: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, bookings, "Hotel bookings fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};
