require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// HTTP request logger (dev only)
if (process.env.NODE_ENV !== "production") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[${process.env.NODE_ENV}] Server running on http://localhost:${PORT}`);
  });
});
