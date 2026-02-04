import jwt from "jsonwebtoken";

// Generate Token
const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  // Set JWT as an HTTP-Only Cookie
  res.cookie("jwt", token, {
    httpOnly: true, //prevent XSS attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent CSRF attack
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
