// utils.js
// ======================== UTILITY FUNCTIONS ========================
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const { v2: cloudinary } = require('cloudinary');

const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

async function checkEmailExists(email, excludeId = null, excludeType = null) {
  try {
    let adminCheck, employeeCheck;

    if (excludeType === "admin" && excludeId) {
      adminCheck = await pool.query(
        `SELECT email_id FROM admins WHERE email_id = $1 AND admin_id != $2`,
        [email, excludeId],
      );
    } else {
      adminCheck = await pool.query(
        `SELECT email_id FROM admins WHERE email_id = $1`,
        [email],
      );
    }

    if (excludeType === "employee" && excludeId) {
      employeeCheck = await pool.query(
        `SELECT email_id FROM employees WHERE email_id = $1 AND employee_id != $2`,
        [email, excludeId],
      );
    } else {
      employeeCheck = await pool.query(
        `SELECT email_id FROM employees WHERE email_id = $1`,
        [email],
      );
    }

    return adminCheck.rows.length > 0 || employeeCheck.rows.length > 0;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  return { valid: true };
}

function validateSignupData(data, userType) {
  const { email, username, password, lastName, phoneNumber, gender, age } =
    data;

  if (
    !email ||
    !username ||
    !password ||
    !lastName ||
    !phoneNumber ||
    !gender ||
    !age
  ) {
    return { valid: false, message: "All required fields must be filled" };
  }

  if (userType === "employee" && (!data.department || !data.role)) {
    return {
      valid: false,
      message: "Department and role are required for employees",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }

  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
    return { valid: false, message: "Age must be between 18 and 100" };
  }

  return { valid: true };
}

// ======================== CLOUDINARY UTILITY FUNCTIONS ========================

// Delete image from Cloudinary
async function deleteCloudinaryImage(publicId) {
  try {
    if (!publicId) {
      console.log("⚠️ No public ID provided for deletion");
      return null;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("🗑️ Cloudinary image deleted:", publicId, result);
    return result;
  } catch (error) {
    console.error("❌ Error deleting Cloudinary image:", error);
    return null;
  }
}

// Extract public ID from Cloudinary URL
function extractPublicIdFromUrl(imageUrl) {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return null;
    }
    
    // Example URL: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/profile-pictures/profile_1234567890_abcdef.jpg
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload/v{version}/'
    const pathAfterVersion = parts.slice(uploadIndex + 2).join('/');
    
    // Remove file extension
    const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error("❌ Error extracting public ID from URL:", error);
    return null;
  }
}

// Generate optimized image URL
function generateOptimizedImageUrl(publicId, options = {}) {
  try {
    if (!publicId) return null;
    
    const defaultOptions = {
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto:good',
      format: 'auto'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    return cloudinary.url(publicId, finalOptions);
  } catch (error) {
    console.error("❌ Error generating optimized image URL:", error);
    return null;
  }
}

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  checkEmailExists,
  validatePassword,
  validateSignupData,
  deleteCloudinaryImage,
  extractPublicIdFromUrl,
  generateOptimizedImageUrl,
};