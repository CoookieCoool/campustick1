// Run this ONCE to create the admin account:
// node src/utils/createAdmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

const ADMIN = {
  name:     "Admin",
  email:    "admin@campustick.com",
  password: "admin123",
  role:     "admin",
};

(async () => {
  await connectDB();
  const exists = await User.findOne({ email: ADMIN.email });
  if (exists) {
    console.log("Admin already exists:", ADMIN.email);
  } else {
    await User.create(ADMIN);
    console.log("✅ Admin created:", ADMIN.email, "/ password:", ADMIN.password);
  }
  process.exit();
})();
