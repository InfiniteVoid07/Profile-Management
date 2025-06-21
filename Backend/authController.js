// authController.js
// ======================== AUTH CONTROLLER ========================
const pool = require("./db");
const {
  generateToken,
  hashPassword,
  comparePassword,
  checkEmailExists,
  validatePassword,
  validateSignupData,
  deleteCloudinaryImage,
} = require("./utils");

// ======================== ROOT CONTROLLER ========================
const getRoot = (req, res) => {
  res.json({
    message: "🌐 Enhanced Authentication API Server with Cloudinary Image Upload",
    status: "running",
    timestamp: new Date().toISOString(),
  });
};

// ======================== AUTHENTICATION CONTROLLERS ========================
const signup = async (req, res) => {
  const {
    userType = "employee",
    email,
    username, // This is firstName in the frontend
    password,
    lastName,
    phoneNumber,
    gender,
    age,
    department,
    role,
  } = req.body;

  console.log("📝 Signup request:", { userType, email, username, lastName });

  // Validate input data
  const validation = validateSignupData(req.body, userType);
  if (!validation.valid) {
    // Delete uploaded file from Cloudinary if validation fails
    if (req.file) {
      await deleteCloudinaryImage(req.file.public_id);
    }
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    // Delete uploaded file from Cloudinary if validation fails
    if (req.file) {
      await deleteCloudinaryImage(req.file.public_id);
    }
    return res.status(400).json({
      success: false,
      message: passwordValidation.message,
    });
  }

  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      // Delete uploaded file from Cloudinary if email exists
      if (req.file) {
        await deleteCloudinaryImage(req.file.public_id);
      }
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get profile picture URL from Cloudinary
    const profilePicUrl = req.file ? req.file.secure_url : null;

    let insertQuery, values, user;

    if (userType === "admin") {
      insertQuery = `
        INSERT INTO admins (first_name, last_name, email_id, password, phone_number, gender, age, profile_pic_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING admin_id as id, first_name, last_name, email_id, phone_number, gender, age, profile_pic_url
      `;
      values = [
        username,
        lastName,
        email,
        hashedPassword,
        phoneNumber,
        gender,
        parseInt(age),
        profilePicUrl,
      ];
    } else {
      insertQuery = `
        INSERT INTO employees (first_name, last_name, email_id, password, phone_number, gender, age, department, role, profile_pic_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING employee_id as id, first_name, last_name, email_id, phone_number, gender, age, department, role, profile_pic_url
      `;
      values = [
        username,
        lastName,
        email,
        hashedPassword,
        phoneNumber,
        gender,
        parseInt(age),
        department,
        role,
        profilePicUrl,
      ];
    }

    const result = await pool.query(insertQuery, values);
    user = { ...result.rows[0], user_type: userType };

    console.log("✅ User created successfully:", user.id);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email_id,
      type: userType,
    });

    res.status(201).json({
      success: true,
      message: `${userType === "admin" ? "Admin" : "Employee"} account created successfully`,
      token,
      user,
    });
  } catch (error) {
    // Delete uploaded file from Cloudinary if database error occurs
    if (req.file) {
      await deleteCloudinaryImage(req.file.public_id);
    }
    console.error("❌ Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during signup. Please try again.",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login attempt for:", email);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // Check admins first
    let result = await pool.query(
      `SELECT admin_id as id, first_name, last_name, email_id, phone_number, 
              gender, age, profile_pic_url, password
       FROM admins WHERE email_id = $1`,
      [email],
    );

    let userType = "admin";

    // If not found in admins, check employees
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT employee_id as id, first_name, last_name, email_id, phone_number, 
                gender, age, department, role, profile_pic_url, password
         FROM employees WHERE email_id = $1`,
        [email],
      );
      userType = "employee";
    }

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { password: _, ...userData } = user;
    const userWithType = { ...userData, user_type: userType };

    const token = generateToken({
      id: user.id,
      email: user.email_id,
      type: userType,
    });

    console.log("✅ Login successful for:", email, "Type:", userType);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithType,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again.",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { id, type } = req.user;

    let query;
    if (type === "admin") {
      query = `SELECT admin_id as id, first_name, last_name, email_id, phone_number, 
               gender, age, profile_pic_url FROM admins WHERE admin_id = $1`;
    } else {
      query = `SELECT employee_id as id, first_name, last_name, email_id, phone_number, 
               gender, age, department, role, profile_pic_url FROM employees WHERE employee_id = $1`;
    }

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = { ...result.rows[0], user_type: type };
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id, type } = req.user;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message,
    });
  }

  try {
    const table = type === "admin" ? "admins" : "employees";
    const idField = type === "admin" ? "admin_id" : "employee_id";

    const result = await pool.query(
      `SELECT password FROM ${table} WHERE ${idField} = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      result.rows[0].password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await pool.query(
      `UPDATE ${table} SET password = $1 WHERE ${idField} = $2`,
      [hashedNewPassword, id],
    );

    console.log("✅ Password updated for user:", id);

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("❌ Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change",
    });
  }
};

const logout = (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

// ======================== EMPLOYEE CONTROLLERS ========================
const getEmployeeDashboard = async (req, res) => {
  try {
    const { id, type } = req.user;

    if (type !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Employee access required.",
      });
    }

    // Get current employee data
    const currentEmployeeQuery = await pool.query(
      `SELECT employee_id as id, first_name, last_name, email_id, phone_number, 
              gender, age, department, role, profile_pic_url, 'employee' as user_type 
       FROM employees WHERE employee_id = $1`,
      [id],
    );

    // Get all employees for display (optional - you can remove this if not needed)
    const allEmployeesQuery = await pool.query(
      `SELECT employee_id as id, first_name, last_name, email_id, phone_number, 
              gender, age, department, role, profile_pic_url, 'employee' as user_type 
       FROM employees`,
    );

    res.json({
      success: true,
      data: {
        currentUser: currentEmployeeQuery.rows[0],
        allEmployees: allEmployeesQuery.rows,
        stats: {
          totalEmployees: allEmployeesQuery.rows.length,
        },
      },
    });
  } catch (error) {
    console.error("❌ Employee dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard data",
    });
  }
};

module.exports = {
  // Root
  getRoot,
  
  // Authentication
  signup,
  login,
  getProfile,
  changePassword,
  logout,
  
  // Employee Dashboard
  getEmployeeDashboard,
};