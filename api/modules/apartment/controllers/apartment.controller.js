import prisma from "../../../config/db.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../../../utils/cloudinaryUpload.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Create a new apartment
 * @route   POST /api/apartments
 * @access  Admin
 */
export const createApartment = async (req, res, next) => {
  try {
    const {
      hotelId,
      apartmentNumber,
      name,
      description,
      images,
      pricePerNight,
      totalCapacity,
      numberOfBedrooms,
      numberOfBathrooms,
      floorNumber,
      areaSqm,
      apartmentType,
      roomsBookableSeparately,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      { name: "hotelId", value: hotelId },
      { name: "apartmentNumber", value: apartmentNumber },
      { name: "name", value: name },
      { name: "pricePerNight", value: pricePerNight },
      { name: "totalCapacity", value: totalCapacity },
      { name: "numberOfBedrooms", value: numberOfBedrooms },
      { name: "numberOfBathrooms", value: numberOfBathrooms },
      { name: "apartmentType", value: apartmentType },
    ];

    for (const field of requiredFields) {
      if (
        field.value === undefined ||
        field.value === null ||
        field.value === ""
      ) {
        throw new ApiError(400, `Required field is missing: ${field.name}`);
      }
    }

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // Check if apartment number already exists in this hotel
    const existingApartment = await prisma.apartment.findFirst({
      where: {
        hotelId,
        apartmentNumber,
      },
    });

    if (existingApartment) {
      throw new ApiError(400, "Apartment number already exists in this hotel");
    }

    // Upload images to Cloudinary if provided
    let uploadedImages = [];
    if (images && images.length > 0) {
      uploadedImages = await uploadMultipleToCloudinary(images, "apartments");
    }

    // Create apartment
    const apartment = await prisma.apartment.create({
      data: {
        hotelId,
        apartmentNumber,
        name,
        description,
        images: uploadedImages,
        pricePerNight,
        totalCapacity,
        numberOfBedrooms,
        numberOfBathrooms,
        floorNumber,
        areaSqm,
        apartmentType,
        roomsBookableSeparately: roomsBookableSeparately || false,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, apartment, "Apartment created successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all apartments
 * @route   GET /api/apartments
 * @access  Public
 */
export const getAllApartments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      hotelId,
      apartmentType,
      minPrice,
      maxPrice,
      minBedrooms,
      isAvailable,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter object
    const where = {};
    if (hotelId) where.hotelId = hotelId;
    if (apartmentType) where.apartmentType = apartmentType;
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
    }
    if (minBedrooms) where.numberOfBedrooms = { gte: parseInt(minBedrooms) };
    if (isAvailable !== undefined) where.isAvailable = isAvailable === "true";

    // Handle search query
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { apartmentNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get apartments with pagination
    const [apartments, total] = await Promise.all([
      prisma.apartment.findMany({
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
              rating: true,
            },
          },
          _count: {
            select: {
              rooms: true,
              apartmentBookings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.apartment.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          apartments,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Apartments fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get apartment by ID
 * @route   GET /api/apartments/:id
 * @access  Public
 */
export const getApartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        hotel: true,
        rooms: {
          include: {
            amenities: true,
          },
        },
        _count: {
          select: {
            apartmentBookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!apartment) {
      throw new ApiError(404, "Apartment not found");
    }

    // Aggregate all amenities from rooms that belong to this apartment
    const amenitiesFromRooms = apartment.rooms.flatMap(
      (room) => room.amenities
    );

    // Add the aggregated amenities to the apartment object
    const apartmentWithAmenities = {
      ...apartment,
      amenities: amenitiesFromRooms,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          apartmentWithAmenities,
          "Apartment fetched successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update apartment
 * @route   PUT /api/apartments/:id
 * @access  Admin
 */
export const updateApartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images, ...updateData } = req.body;

    // Check if apartment exists
    const existingApartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (!existingApartment) {
      throw new ApiError(404, "Apartment not found");
    }

    // If apartment number is being updated, check for duplicates
    if (
      updateData.apartmentNumber &&
      updateData.apartmentNumber !== existingApartment.apartmentNumber
    ) {
      const numberExists = await prisma.apartment.findFirst({
        where: {
          hotelId: existingApartment.hotelId,
          apartmentNumber: updateData.apartmentNumber,
        },
      });

      if (numberExists) {
        throw new ApiError(
          400,
          "Apartment number already exists in this hotel"
        );
      }
    }

    // Handle images update
    if (images && Array.isArray(images)) {
      const existingUrls = existingApartment.images || [];

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
          "apartments"
        );
      }

      updateData.images = [...urlsToKeep, ...uploadedNewImages];
    }

    // Update apartment
    const apartment = await prisma.apartment.update({
      where: { id },
      data: updateData,
      include: {
        hotel: true,
        rooms: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, apartment, "Apartment updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete apartment
 * @route   DELETE /api/apartments/:id
 * @access  Admin
 */
export const deleteApartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) {
      throw new ApiError(404, "Apartment not found");
    }

    // Delete images from Cloudinary if they exist
    if (apartment.images && apartment.images.length > 0) {
      await deleteMultipleFromCloudinary(apartment.images);
    }

    // Delete apartment (cascade will handle rooms and bookings)
    await prisma.apartment.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Apartment deleted successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check apartment availability
 * @route   GET /api/apartments/:id/availability?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}
 * @access  Public
 */
export const checkApartmentAvailability = async (req, res, next) => {
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

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) {
      throw new ApiError(404, "Apartment not found");
    }

    if (!apartment.isAvailable) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { available: false },
            "Apartment is not available for booking"
          )
        );
    }

    // Check for manual unavailability in the specific date range
    const manualUnavailability = await prisma.apartmentAvailability.findFirst({
      where: {
        apartmentId: id,
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
            reason: "Manually blocked",
          },
          "Apartment is not available for the selected dates"
        )
      );
    }

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [{ apartmentId: id }, { room: { apartmentId: id } }],
          },
          {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          {
            checkInDate: { lt: checkOut }, // Booking starts before we leave
            checkOutDate: { gt: checkIn }, // Booking ends after we arrive
          },
        ],
      },
    });

    const isAvailable = overlappingBookings.length === 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          available: isAvailable,
          conflictingBookings: overlappingBookings.length,
        },
        isAvailable
          ? "Apartment is available for the selected dates"
          : "Apartment is not available for the selected dates"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get apartments by hotel
 * @route   GET /api/hotels/:hotelId/apartments
 * @access  Public
 */
export const getApartmentsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    const apartments = await prisma.apartment.findMany({
      where: { hotelId },
      include: {
        _count: {
          select: {
            rooms: true,
            apartmentBookings: true,
          },
        },
      },
      orderBy: { apartmentNumber: "asc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, apartments, "Apartments fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get global apartment statistics
 * @route   GET /api/apartments/stats
 * @access  Admin
 */
export const getGlobalApartmentStats = async (req, res, next) => {
  try {
    const [
      totalApartments,
      availableApartments,
      unavailableApartments,
      averagePrice,
      apartmentsByType,
    ] = await Promise.all([
      prisma.apartment.count(),
      prisma.apartment.count({ where: { isAvailable: true } }),
      prisma.apartment.count({ where: { isAvailable: false } }),
      prisma.apartment.aggregate({
        _avg: { pricePerNight: true },
      }),
      prisma.apartment.groupBy({
        by: ["apartmentType"],
        _count: {
          _all: true,
        },
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalApartments,
          availableApartments,
          unavailableApartments,
          averagePrice: averagePrice._avg.pricePerNight || 0,
          apartmentsByType: apartmentsByType.map((item) => ({
            type: item.apartmentType,
            count: item._count._all,
          })),
        },
        "Global apartment statistics fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
