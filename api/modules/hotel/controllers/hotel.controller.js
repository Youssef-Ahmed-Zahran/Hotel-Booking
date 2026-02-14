import prisma from "../../../config/db.js";
import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../../../utils/cloudinaryUpload.js";

// Import generic handlers
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Create a new hotel
 * @route   POST /api/hotels
 * @access  Admin
 */
export const createHotel = async (req, res, next) => {
  try {
    const {
      email,
      name,
      description,
      address,
      city,
      country,
      postalCode,
      phoneNumber,
      images,
      rating,
      isFeatured,
    } = req.body;

    // Validate required fields
    if (!email || !name || !address || !city || !country) {
      throw new ApiError(
        400,
        "Please provide all required fields: email, name, address, city, country"
      );
    }

    // Check if hotel with same email already exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { email },
    });

    if (existingHotel) {
      throw new ApiError(400, "Hotel with this email already exists");
    }

    // Upload images to Cloudinary if provided
    let imageUrls = [];
    if (images && Array.isArray(images) && images.length > 0) {
      imageUrls = await uploadMultipleToCloudinary(images, "hotels");
    }

    // Create hotel
    const hotel = await prisma.hotel.create({
      data: {
        email,
        name,
        description,
        address,
        city,
        country,
        postalCode,
        phoneNumber,
        images: imageUrls,
        rating: rating || 1,
        isFeatured: isFeatured || false,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, hotel, "Hotel created successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured hotels
 * @route   GET /api/hotels/featured
 * @access  Public
 */
export const getFeaturedHotels = async (req, res, next) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { rating: "desc" },
      take: 4, // Limit to 4 featured hotels for the home page
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, hotels, "Featured hotels fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all hotels
 * @route   GET /api/hotels
 * @access  Public
 */
export const getAllHotels = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      country,
      minRating,
      isActive,
      amenities, // Comma separated amenity names
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter object
    const where = {};
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (country) where.country = { contains: country, mode: "insensitive" };
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (isActive !== undefined) where.isActive = isActive === "true";

    const conditions = [];

    // Filter by search (name, description, city, country, address)
    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Filter by amenities (Hotels having ANY room with matching amenities)
    if (amenities) {
      const amenityNames = amenities.split(",");
      conditions.push({
        rooms: {
          some: {
            amenities: {
              some: {
                name: { in: amenityNames },
              },
            },
          },
        },
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Get hotels with pagination
    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              apartments: true,
              rooms: true,
              bookings: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hotel.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hotels,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Hotels fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get hotel by ID
 * @route   GET /api/hotels/:id
 * @access  Public
 */
export const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        apartments: {
          include: {
            rooms: {
              include: {
                amenities: true,
              },
            },
          },
        },
        rooms: {
          where: { apartmentId: null }, // Only standalone rooms
          include: {
            amenities: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, hotel, "Hotel fetched successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hotel
 * @route   PUT /api/hotels/:id
 * @access  Admin
 */
export const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images, isFeatured, ...updateData } = req.body;

    // Check if hotel exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!existingHotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingHotel.email) {
      const emailExists = await prisma.hotel.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new ApiError(400, "Hotel with this email already exists");
      }
    }

    // Handle images update
    if (images && Array.isArray(images)) {
      const existingUrls = existingHotel.images || [];

      // Identify images to keep (already URLs)
      const urlsToKeep = images.filter((img) => typeof img === "string" && img.startsWith("http"));

      // Identify images to delete (not in the new list)
      const urlsToDelete = existingUrls.filter((url) => !urlsToKeep.includes(url));

      // Identify new images to upload (Base64 strings)
      const base64ToUpload = images.filter((img) => typeof img === "string" && img.startsWith("data:image"));

      if (urlsToDelete.length > 0) {
        await deleteMultipleFromCloudinary(urlsToDelete);
      }

      let uploadedNewImages = [];
      if (base64ToUpload.length > 0) {
        uploadedNewImages = await uploadMultipleToCloudinary(base64ToUpload, "hotels");
      }

      updateData.images = [...urlsToKeep, ...uploadedNewImages];
    }

    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }

    // Update hotel
    const hotel = await prisma.hotel.update({
      where: { id },
      data: updateData,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, hotel, "Hotel updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete hotel
 * @route   DELETE /api/hotels/:id
 * @access  Admin
 */
export const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // Delete images from Cloudinary if they exist
    if (hotel.images && hotel.images.length > 0) {
      await deleteMultipleFromCloudinary(hotel.images);
    }

    // Delete hotel (cascade will handle apartments, rooms, bookings)
    await prisma.hotel.delete({
      where: { id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Hotel deleted successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get hotel statistics
 * @route   GET /api/hotels/:id/stats
 * @access  Admin
 */
export const getHotelStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // Get statistics
    const [
      totalApartments,
      totalRooms,
      totalBookings,
      confirmedBookings,
      totalRevenue,
      averageRating,
    ] = await Promise.all([
      prisma.apartment.count({ where: { hotelId: id } }),
      prisma.room.count({ where: { hotelId: id } }),
      prisma.booking.count({ where: { hotelId: id } }),
      prisma.booking.count({
        where: { hotelId: id, status: "CONFIRMED" },
      }),
      prisma.booking.aggregate({
        where: { hotelId: id, paymentStatus: "COMPLETED" },
        _sum: { paymentAmount: true },
      }),
      prisma.review.aggregate({
        where: { hotelId: id },
        _avg: { rating: true },
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalApartments,
          totalRooms,
          totalBookings,
          confirmedBookings,
          totalRevenue: totalRevenue._sum.paymentAmount || 0,
          averageRating: averageRating._avg.rating || 0,
        },
        "Hotel statistics fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get global hotel statistics
 * @route   GET /api/hotels/stats
 * @access  Admin
 */
export const getGlobalHotelStats = async (req, res, next) => {
  try {
    const [
      totalHotels,
      activeHotels,
      inactiveHotels,
      featuredHotels,
      averageRating,
    ] = await Promise.all([
      prisma.hotel.count(),
      prisma.hotel.count({ where: { isActive: true } }),
      prisma.hotel.count({ where: { isActive: false } }),
      prisma.hotel.count({ where: { isFeatured: true } }),
      prisma.hotel.aggregate({
        _avg: { rating: true },
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalHotels,
          activeHotels,
          inactiveHotels,
          featuredHotels,
          averageRating: averageRating._avg.rating || 0,
        },
        "Global hotel statistics fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
