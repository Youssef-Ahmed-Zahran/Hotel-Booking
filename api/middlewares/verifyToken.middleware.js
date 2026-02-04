import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid Token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in verifyToken middleware:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Admin and user authorization
export const verifyTokenAndAuthorization = async (req, res, next) => {
  // First verify the token (this will set req.user)
  await verifyToken(req, res, () => {
    // Check if user is accessing their own resource or is an admin
    if (
      req.user.id === req.params.id ||
      req.user.role === "ADMIN"
    ) {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - You can only access your own account." });
    }
  });
};

// Admin only
export const verifyTokenAndAdmin = async (req, res, next) => {
  // First verify the token (this will set req.user)
  await verifyToken(req, res, () => {
    // Check if user is an admin
    if (req.user.role === "ADMIN") {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Admin access required." });
    }
  });
};

