import prisma from "../../../config/db.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Get all dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Admin
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [
            totalHotels,
            totalRooms,
            totalApartments,
            totalUsers,
            totalBookings,
            totalRevenue,
            recentBookings,
            usersByRole,
            bookingsByStatus,
            roomsByType
        ] = await Promise.all([
            prisma.hotel.count(),
            prisma.room.count(),
            prisma.apartment.count(),
            prisma.user.count(),
            prisma.booking.count(),
            prisma.booking.aggregate({
                where: { paymentStatus: "COMPLETED" },
                _sum: { paymentAmount: true },
            }),
            prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { username: true } },
                    hotel: { select: { name: true } },
                },
            }),
            prisma.user.groupBy({
                by: ["role"],
                _count: { _all: true },
            }),
            prisma.booking.groupBy({
                by: ["status"],
                _count: { _all: true },
            }),
            prisma.room.groupBy({
                by: ["roomType"],
                _count: { _all: true },
            })
        ]);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    totalHotels,
                    totalRooms,
                    totalApartments,
                    totalUsers,
                    totalBookings,
                    totalRevenue: totalRevenue._sum.paymentAmount || 0,
                    recentBookings,
                    usersByRole: usersByRole.map((item) => ({
                        role: item.role,
                        count: item._count._all,
                    })),
                    bookingsByStatus: bookingsByStatus.map((item) => ({
                        status: item.status,
                        count: item._count._all,
                    })),
                    roomsByType: roomsByType.map((item) => ({
                        type: item.roomType,
                        count: item._count._all,
                    })),
                },
                "Dashboard statistics fetched successfully"
            )
        );
    } catch (error) {
        next(error);
    }
};
