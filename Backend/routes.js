// routes.js
// ======================== ROUTES CONFIGURATION ========================
const express = require("express");
const multer = require("multer");
const router = express.Router();

// Import middleware
const {
  authenticateToken,
  requireAdmin,
  checkUserPermission,
  checkEmployeePermission,
} = require("./middleware");

// Import controllers
const authController = require("./authController");
const adminController = require("./adminController");

// ======================== MULTER CONFIGURATION FOR CLOUDINARY ========================
// Configure multer to use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ======================== ROOT ROUTE ========================
router.get("/", authController.getRoot);

// ======================== AUTHENTICATION ROUTES ========================

// Signup Route with Image Upload
router.post("/api/auth/signup", upload.single("profilePicture"), authController.signup);

// Login Route
router.post("/api/auth/login", authController.login);

// Profile Route
router.get("/api/auth/profile", authenticateToken, authController.getProfile);

// Change Password Route
router.patch("/api/auth/change-password", authenticateToken, authController.changePassword);

// Logout Route
router.post("/api/auth/logout", authenticateToken, authController.logout);

// ======================== ADMIN DASHBOARD ROUTES ========================

// Dashboard Data Route
router.get("/api/dashboard", authenticateToken, requireAdmin, adminController.getDashboard);

// Enhanced Edit User Route (Admin can edit anyone, Employee can edit themselves)
router.patch(
  "/api/users/:type/:id",
  authenticateToken,
  checkEmployeePermission,
  upload.single("profilePicture"),
  adminController.editUser,
);

// Enhanced Delete User Route (Admin can delete anyone, Employee can delete themselves)
router.delete(
  "/api/users/:type/:id",
  authenticateToken,
  checkUserPermission,
  adminController.deleteUser,
);

// Employee Search Route (Admin only)
router.get(
  "/api/employees/search",
  authenticateToken,
  requireAdmin,
  adminController.searchEmployees,
);

// ======================== EMPLOYEE ROUTES ========================

// Employee Dashboard - Get own profile and other employees (read-only)
router.get("/api/employee-dashboard", authenticateToken, authController.getEmployeeDashboard);

module.exports = router;