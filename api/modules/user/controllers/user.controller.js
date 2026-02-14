import prisma from "../../../config/db.js";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "../../auth/controllers/auth.controller.js";
export { getCurrentUser };

// Import generic handlers
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter object
    const where = {};
    if (role) where.role = role;

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profileImageUrl: true,
          role: true,
          createdDate: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdDate: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Users fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  User/Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profileImageUrl: true,
        role: true,
        createdDate: true,
        lastModifiedDate: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
      new ApiResponse(200, user, "User fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  User/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phoneNumber,
      profileImageUrl,
      password,
      username,
      email,
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // Check if new email/username is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) throw new ApiError(400, "Email already in use");
    }

    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });
      if (usernameExists) throw new ApiError(400, "Username already taken");
    }

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (profileImageUrl !== undefined)
      updateData.profileImageUrl = profileImageUrl;

    // Hash password if being updated
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profileImageUrl: true,
        role: true,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User updated successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json(
      new ApiResponse(200, null, "User deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   POST /api/users/change-password
 * @access  User
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Get from verifyToken middleware

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Please provide current and new password");
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Password changed successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get global user statistics
 * @route   GET /api/users/stats
 * @access  Admin
 */
export const getGlobalUserStats = async (req, res, next) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [totalUsers, usersByRole, newUsersLastMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: {
          _all: true,
        },
      }),
      prisma.user.count({
        where: {
          createdDate: {
            gte: lastMonth,
          },
        },
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalUsers,
          usersByRole: usersByRole.map((item) => ({
            role: item.role,
            count: item._count._all,
          })),
          newUsersLastMonth,
        },
        "Global user statistics fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
