const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic field validation
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    // Role is always student on self-registration — only admin can promote
    const user = await User.create({ name, email, password, role: "student" });

    res.status(201).json({
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get logged-in user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware
    res.json({ user: formatUser(req.user) });
  } catch (err) {
    next(err);
  }
};

// @desc   Promote a user to organizer (admin only)
// @route  PATCH /api/auth/promote/:id
// @access Private/Admin
const promoteToOrganizer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "organizer")
      return res.status(400).json({ message: "User is already an organizer" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot change role of an admin" });

    user.role = "organizer";
    await user.save();
    res.json({ message: `${user.name} is now an organizer`, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// @desc   Demote an organizer back to student (admin only)
// @route  PATCH /api/auth/demote/:id
// @access Private/Admin
const demoteToStudent = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot change role of an admin" });
    if (user.role === "student")
      return res.status(400).json({ message: "User is already a student" });

    user.role = "student";
    await user.save();
    res.json({ message: `${user.name} has been demoted to student`, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all users (admin only)
// @route  GET /api/auth/users
// @access Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, promoteToOrganizer, demoteToStudent, getAllUsers };
