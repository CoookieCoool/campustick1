const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes — verifies Bearer JWT token
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized, no token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user)
      return res.status(401).json({ message: "User belonging to this token no longer exists" });
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Token expired, please login again" : "Invalid token";
    res.status(401).json({ message });
  }
};

module.exports = protect;
