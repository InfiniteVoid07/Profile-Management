// index.js
// ======================== DEPENDENCIES & SETUP ========================
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import routes and middleware
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware");

const app = express();
const PORT = process.env.PORT;

// ======================== MIDDLEWARE ========================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// ======================== CLOUDINARY SETUP ========================
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
(async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log(`✅ Cloudinary connected successfully`);
    console.log(`🖼️ Images being uploaded to: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  } catch (error) {
    console.error(`🖼️ ❌ Cloudinary connection failed:`, error.message);
  }
})();

// ======================== ROUTES ========================
app.use(routes);

// ======================== ERROR HANDLING ========================
app.use(errorHandler);
app.use("*", notFoundHandler);

// ======================== SERVER STARTUP ========================
// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Enhanced Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}`);
    console.log(`🖼️ Images served from: Cloudinary CDN`);
  });
}

// Export for Vercel
module.exports = app;