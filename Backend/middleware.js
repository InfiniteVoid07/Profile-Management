// middleware.js
// ======================== MIDDLEWARE FUNCTIONS ========================
const jwt = require("jsonwebtoken");
const multer = require("multer");

const JWT_SECRET = process.env.JWT_SECRET;

// ======================== AUTHENTICATION MIDDLEWARE ========================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ JWT verification error:", err);
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.type !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
}

// New middleware to check if user can edit/delete (admin or own account)
function checkUserPermission(req, res, next) {
  const { type, id } = req.params;
  const currentUser = req.user;

  // Admin can edit/delete anyone
  if (currentUser.type === "admin") {
    return next();
  }

  // Employee can only edit/delete their own account
  if (
    currentUser.type === "employee" &&
    type === "employee" &&
    currentUser.id == id
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. You can only modify your own account.",
  });
}

// Enhanced permission check specifically for employee operations
function checkEmployeePermission(req, res, next) {
  const { id } = req.params;
  const currentUser = req.user;

  // Admin can edit/delete any employee
  if (currentUser.type === "admin") {
    return next();
  }

  // Employee can only edit/delete their own account
  if (currentUser.type === "employee" && currentUser.id == id) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. You can only modify your own account.",
  });
}

// ======================== ERROR HANDLING MIDDLEWARE ========================
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
  }

  if (err.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed for profile pictures.",
    });
  }

  console.error("💥 Unexpected error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "🚫 API endpoint not found",
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  checkUserPermission,
  checkEmployeePermission,
  errorHandler,
  notFoundHandler,
};