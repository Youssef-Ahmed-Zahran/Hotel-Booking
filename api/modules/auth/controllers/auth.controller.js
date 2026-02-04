import prisma from "../../../config/db.js";
import bcrypt from "bcryptjs";
import generateToken from "../../../utils/createToken.js";

// Import generic handlers
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber } =
      req.body;

    // Validate required fields
    if (!username || !email || !password) {
      throw new ApiError(400, "Please provide username, email, and password");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const message =
        existingUser.email === email
          ? "Email already registered"
          : "Username already taken";
      throw new ApiError(400, message);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: "USER",
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdDate: true,
      },
    });

    // Generate JWT token and set cookie
    const token = generateToken(res, user.id, user.role);

    return res
      .status(201)
      .json(
        new ApiResponse(201, { user, token }, "User registered successfully")
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new ApiError(400, "Please provide email and password");
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate JWT token and set cookie
    const token = generateToken(res, user.id, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: userWithoutPassword, token },
          "Login successful"
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  User
 */
export const logout = async (req, res, next) => {
  try {
    // Clear the JWT cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logout successful"));
  } catch (error) {
    next(error);
  }
};
