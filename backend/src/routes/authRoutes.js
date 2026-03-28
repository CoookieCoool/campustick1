const express = require("express");
const { register, login, getMe, promoteToOrganizer, demoteToStudent, getAllUsers } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Private
router.get("/me", protect, getMe);

// Admin only
router.get("/users",        protect, authorizeAdmin, getAllUsers);
router.patch("/promote/:id", protect, authorizeAdmin, promoteToOrganizer);
router.patch("/demote/:id",  protect, authorizeAdmin, demoteToStudent);

module.exports = router;
