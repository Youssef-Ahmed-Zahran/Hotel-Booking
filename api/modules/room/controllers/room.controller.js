import prisma from "../../../config/db.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../../../utils/cloudinaryUpload.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Admin
 */
export const createRoom = async (req, res, next) => {
  try {
    const {
      hotelId,
      apartmentId,
      roomNumber,
      description,
      images,
      pricePerNight,
      capacity,
      roomType,
      bookableIndividually,
      amenityIds, // Array of amenity IDs
    } = req.body;

    // Validate: Room must belong to either hotel or apartment
    if (!hotelId && !apartmentId) {
      throw new ApiError(
        400,
        "Room must belong to either a hotel or an apartment"
      );
    }

    // Validate required fields
    if (!roomNumber || !pricePerNight || !capacity || !roomType) {
      throw new ApiError(
        400,
        "Please provide all required fields: roomNumber, pricePerNight, capacity, roomType"
      );
    }

    // If apartmentId is provided, verify apartment exists and get its hotelId
    let finalHotelId = hotelId;
    if (apartmentId) {
      const apartment = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        select: { hotelId: true },
      });

      if (!apartment) {
        throw new ApiError(404, "Apartment not found");
      }

      finalHotelId = apartment.hotelId;
    } else if (hotelId) {
      // Verify hotel exists
      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
      });

      if (!hotel) {
        throw new ApiError(404, "Hotel not found");
      }
    }

    // Check if room number already exists in this hotel
    const existingRoom = await prisma.room.findFirst({
      where: {
        hotelId: finalHotelId,
        roomNumber,
      },
    });

    if (existingRoom) {
      throw new ApiError(400, "Room number already exists in this hotel");
    }

    // Upload images to Cloudinary if provided
    let uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages = await uploadMultipleToCloudinary(images, "rooms");
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        hotelId: finalHotelId,
        apartmentId: apartmentId || null,
        roomNumber,
        description,
        images: uploadedImages,
        pricePerNight,
        capacity,
        roomType,
        bookableIndividually:
          bookableIndividually !== undefined ? bookableIndividually : true,
        amenities: amenityIds
          ? {
              connect: amenityIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
          },
        },
        apartment: {
          select: {
            apartmentNumber: true,
          },
        },
        amenities: true,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, room, "Room created successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all rooms
 * @route   GET /api/rooms
 * @access  Public
 */
export const getAllRooms = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      hotelId,
      apartmentId,
      roomType,
      minPrice,
      maxPrice,
      minCapacity,
      isAvailable,
      bookableIndividually,
      amenities,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter object
    const where = {};

    // Build base filters
    const baseFilters = {};
    if (hotelId) baseFilters.hotelId = hotelId;
    if (apartmentId) baseFilters.apartmentId = apartmentId;
    if (roomType) baseFilters.roomType = roomType;
    if (minPrice || maxPrice) {
      baseFilters.pricePerNight = {};
      if (minPrice) baseFilters.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) baseFilters.pricePerNight.lte = parseFloat(maxPrice);
    }
    if (minCapacity) baseFilters.capacity = { gte: parseInt(minCapacity) };
    if (isAvailable !== undefined)
      baseFilters.isAvailable = isAvailable === "true";
    if (bookableIndividually !== undefined)
      baseFilters.bookableIndividually = bookableIndividually === "true";

    // Filter by amenities
    if (amenities) {
      const amenityNames = amenities.split(",");
      baseFilters.amenities = {
        some: {
          name: { in: amenityNames },
        },
      };
    }

    // Implement search logic
    if (search) {
      where.AND = [
        baseFilters,
        {
          OR: [
            { roomNumber: { contains: search, mode: "insensitive" } },
            {
              hotel: {
                name: { contains: search, mode: "insensitive" },
              },
            },
            {
              apartment: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        },
      ];
    } else {
      // No search, just apply base filters
      Object.assign(where, baseFilters);
    }

    // Get rooms with pagination
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take,
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
          _count: {
            select: {
              roomBookings: true,
            },
          },
          amenities: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.room.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          rooms,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Rooms fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get room by ID
 * @route   GET /api/rooms/:id
 * @access  Public
 */
export const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        hotel: true,
        apartment: true,
        amenities: true,
        _count: {
          select: {
            roomBookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, room, "Room fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room
 * @route   PUT /api/rooms/:id
 * @access  Admin
 */
export const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images, ...updateData } = req.body;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      throw new ApiError(404, "Room not found");
    }

    // If room number is being updated, check for duplicates
    if (
      updateData.roomNumber &&
      updateData.roomNumber !== existingRoom.roomNumber
    ) {
      const numberExists = await prisma.room.findFirst({
        where: {
          hotelId: existingRoom.hotelId,
          roomNumber: updateData.roomNumber,
        },
      });

      if (numberExists) {
        throw new ApiError(400, "Room number already exists in this hotel");
      }
    }

    // Handle images update
    if (images && Array.isArray(images)) {
      const existingUrls = existingRoom.images || [];

      // Identify images to keep (already URLs)
      const urlsToKeep = images.filter(
        (img) => typeof img === "string" && img.startsWith("http")
      );

      // Identify images to delete (not in the new list)
      const urlsToDelete = existingUrls.filter(
        (url) => !urlsToKeep.includes(url)
      );

      // Identify new images to upload (Base64 strings)
      const base64ToUpload = images.filter(
        (img) => typeof img === "string" && img.startsWith("data:image")
      );

      if (urlsToDelete.length > 0) {
        await deleteMultipleFromCloudinary(urlsToDelete);
      }

      let uploadedNewImages = [];
      if (base64ToUpload.length > 0) {
        uploadedNewImages = await uploadMultipleToCloudinary(
          base64ToUpload,
          "rooms"
        );
      }

      updateData.images = [...urlsToKeep, ...uploadedNewImages];
    }

    // Handle amenities update
    if (updateData.amenityIds) {
      updateData.amenities = {
        set: updateData.amenityIds.map((id) => ({ id })),
      };
      delete updateData.amenityIds;
    }

    // Update room
    const room = await prisma.room.update({
      where: { id },
      data: updateData,
      include: {
        hotel: true,
        apartment: true,
        amenities: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, room, "Room updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete room
 * @route   DELETE /api/rooms/:id
 * @access  Admin
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    // Delete images from Cloudinary if they exist
    if (room.images && room.images.length > 0) {
      await deleteMultipleFromCloudinary(room.images);
    }

    // Delete room
    await prisma.room.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Room deleted successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check room availability
 * @route   GET /api/rooms/:id/availability
 * @access  Public
 */
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      throw new ApiError(400, "Please provide checkInDate and checkOutDate");
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      throw new ApiError(400, "Check-out date must be after check-in date");
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        apartment: true,
      },
    });

    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    if (!room.isAvailable) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            available: false,
            message: "Room is not available for booking",
            conflictingBookings: 0,
          },
          "Room is not available for booking"
        )
      );
    }

    // Check for manual unavailability in the specific date range
    const manualUnavailability = await prisma.roomAvailability.findFirst({
      where: {
        roomId: id,
        date: {
          gte: checkIn,
          lt: checkOut,
        },
        isAvailable: false,
      },
    });

    if (manualUnavailability) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            available: false,
            message:
              "Room is not available for the selected dates (Manually blocked)",
            conflictingBookings: 0,
          },
          "Room is not available for the selected dates"
        )
      );
    }

    // Check for overlapping room bookings
    const overlappingRoomBookings = await prisma.booking.findMany({
      where: {
        roomId: id,
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

    // If room belongs to an apartment, check if apartment is booked
    let apartmentBookings = [];
    if (room.apartmentId) {
      apartmentBookings = await prisma.booking.findMany({
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
    }

    const isAvailable =
      overlappingRoomBookings.length === 0 && apartmentBookings.length === 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          available: isAvailable,
          message: isAvailable
            ? "Room is available for the selected dates"
            : apartmentBookings.length > 0
            ? "Room is not available because the entire apartment is booked"
            : "Room is not available for the selected dates",
          conflictingBookings:
            overlappingRoomBookings.length + apartmentBookings.length,
        },
        "Room availability checked successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rooms by apartment
 * @route   GET /api/apartments/:apartmentId/rooms
 * @access  Public
 */
export const getRoomsByApartment = async (req, res, next) => {
  try {
    const { apartmentId } = req.params;

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      throw new ApiError(404, "Apartment not found");
    }

    const rooms = await prisma.room.findMany({
      where: { apartmentId },
      include: {
        amenities: true,
        _count: {
          select: {
            roomBookings: true,
          },
        },
      },
      orderBy: { roomNumber: "asc" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rooms by hotel
 * @route   GET /api/hotels/:hotelId/rooms
 * @access  Public
 */
export const getRoomsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: {
        apartment: {
          select: {
            id: true,
            name: true,
            apartmentNumber: true,
          },
        },
        _count: {
          select: {
            roomBookings: true,
          },
        },
        amenities: true,
      },
      orderBy: { roomNumber: "asc" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get global room statistics
 * @route   GET /api/rooms/stats
 * @access  Admin
 */
export const getGlobalRoomStats = async (req, res, next) => {
  try {
    const [
      totalRooms,
      availableRooms,
      unavailableRooms,
      averagePrice,
      roomsByType,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { isAvailable: true } }),
      prisma.room.count({ where: { isAvailable: false } }),
      prisma.room.aggregate({
        _avg: { pricePerNight: true },
      }),
      prisma.room.groupBy({
        by: ["roomType"],
        _count: {
          _all: true,
        },
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalRooms,
          availableRooms,
          unavailableRooms,
          averagePrice: averagePrice._avg.pricePerNight || 0,
          roomsByType: roomsByType.map((item) => ({
            type: item.roomType,
            count: item._count._all,
          })),
        },
        "Global room statistics fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
