// adminController.js
// ======================== ADMIN CONTROLLER ========================
const pool = require("./db");
const {
  hashPassword,
  checkEmailExists,
  validatePassword,
  deleteCloudinaryImage,
} = require("./utils");

// ======================== ADMIN DASHBOARD CONTROLLERS ========================
const getDashboard = async (req, res) => {
  try {
    const adminsQuery = await pool.query(
      `SELECT admin_id as id, first_name, last_name, email_id, phone_number, 
              gender, age, profile_pic_url, 'admin' as user_type FROM admins`,
    );

    const employeesQuery = await pool.query(
      `SELECT employee_id as id, first_name, last_name, email_id, phone_number, 
              gender, age, department, role, profile_pic_url, 'employee' as user_type FROM employees`,
    );

    res.json({
      success: true,
      data: {
        admins: adminsQuery.rows,
        employees: employeesQuery.rows,
        stats: {
          totalAdmins: adminsQuery.rows.length,
          totalEmployees: employeesQuery.rows.length,
          totalUsers: adminsQuery.rows.length + employeesQuery.rows.length,
        },
      },
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard data",
    });
  }
};

const editUser = async (req, res) => {
  const { type, id } = req.params;
  const data = req.body;

  console.log("🔧 User editing:", {
    type,
    id,
    editorId: req.user.id,
    editorType: req.user.type,
  });

  if (!["admin", "employee"].includes(type)) {
    if (req.file) {
      await deleteCloudinaryImage(req.file.public_id);
    }
    return res.status(400).json({
      success: false,
      message: "Invalid user type",
    });
  }

  try {
    // Check if email already exists for other users
    if (data.email_id) {
      const emailExists = await checkEmailExists(data.email_id, id, type);
      if (emailExists) {
        if (req.file) {
          await deleteCloudinaryImage(req.file.public_id);
        }
        return res.status(409).json({
          success: false,
          message: "Email already registered to another user",
        });
      }
    }

    // Hash password if provided
    if (data.password) {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.valid) {
        if (req.file) {
          await deleteCloudinaryImage(req.file.public_id);
        }
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
        });
      }
      data.password = await hashPassword(data.password);
    }

    // Get current user data to check for old profile picture
    const table = type === "admin" ? "admins" : "employees";
    const idField = type === "admin" ? "admin_id" : "employee_id";

    const currentUserResult = await pool.query(
      `SELECT profile_pic_url FROM ${table} WHERE ${idField} = $1`,
      [id],
    );

    if (currentUserResult.rows.length === 0) {
      if (req.file) {
        await deleteCloudinaryImage(req.file.public_id);
      }
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldProfilePicUrl = currentUserResult.rows[0].profile_pic_url;

    // Handle profile picture update
    if (req.file) {
      data.profile_pic_url = req.file.secure_url;
      // Delete old profile picture from Cloudinary if it exists
      if (oldProfilePicUrl) {
        // Extract public_id from the old URL
        const urlParts = oldProfilePicUrl.split('/');
        const fileNameWithExtension = urlParts[urlParts.length - 1];
        const publicId = `profile_pictures/${fileNameWithExtension.split('.')[0]}`;
        await deleteCloudinaryImage(publicId);
      }
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields =
      type === "admin"
        ? [
            "first_name",
            "last_name",
            "email_id",
            "phone_number",
            "gender",
            "age",
            "profile_pic_url",
            "password",
          ]
        : [
            "first_name",
            "last_name",
            "email_id",
            "phone_number",
            "gender",
            "age",
            "department",
            "role",
            "profile_pic_url",
            "password",
          ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(data[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      if (req.file) {
        await deleteCloudinaryImage(req.file.public_id);
      }
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const returningFields =
      type === "admin"
        ? "admin_id as id, first_name, last_name, email_id, phone_number, gender, age, profile_pic_url"
        : "employee_id as id, first_name, last_name, email_id, phone_number, gender, age, department, role, profile_pic_url";

    const query = `UPDATE ${table} SET ${updateFields.join(", ")} WHERE ${idField} = $${paramCount} RETURNING ${returningFields}`;
    values.push(id);

    const result = await pool.query(query, values);
    const updatedUser = { ...result.rows[0], user_type: type };
    console.log("✅ User updated successfully:", updatedUser.id);

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (req.file) {
      await deleteCloudinaryImage(req.file.public_id);
    }
    console.error("❌ Edit user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user",
    });
  }
};

const deleteUser = async (req, res) => {
  const { type, id } = req.params;

  if (!["admin", "employee"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user type",
    });
  }

  console.log("🗑️ User deleting:", {
    type,
    id,
    deleterType: req.user.type,
    deleterId: req.user.id,
  });

  try {
    const table = type === "admin" ? "admins" : "employees";
    const idField = type === "admin" ? "admin_id" : "employee_id";

    // Get user data before deletion to clean up profile picture
    const userData = await pool.query(
      `SELECT profile_pic_url FROM ${table} WHERE ${idField} = $1`,
      [id],
    );

    if (userData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await pool.query(
      `DELETE FROM ${table} WHERE ${idField} = $1 RETURNING *`,
      [id],
    );

    // Delete profile picture from Cloudinary if it exists
    if (userData.rows[0].profile_pic_url) {
      const profilePicUrl = userData.rows[0].profile_pic_url;
      // Extract public_id from the URL
      const urlParts = profilePicUrl.split('/');
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const publicId = `profile_pictures/${fileNameWithExtension.split('.')[0]}`;
      await deleteCloudinaryImage(publicId);
    }

    console.log("✅ User deleted successfully:", id);

    res.json({
      success: true,
      message: `${type} deleted successfully`,
      deletedUser: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
    });
  }
};

const searchEmployees = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        employees: [],
      });
    }

    const searchTerm = `%${q.trim().toLowerCase()}%`;

    const searchQuery = `
      SELECT employee_id as id, first_name, last_name, email_id, phone_number, 
             gender, age, department, role, profile_pic_url, 'employee' as user_type 
      FROM employees 
      WHERE LOWER(first_name) LIKE $1 
         OR LOWER(last_name) LIKE $1 
         OR LOWER(email_id) LIKE $1 
         OR LOWER(department) LIKE $1 
         OR LOWER(role) LIKE $1
         OR LOWER(CONCAT(first_name, ' ', last_name)) LIKE $1
      ORDER BY first_name ASC, last_name ASC
    `;

    const result = await pool.query(searchQuery, [searchTerm]);

    console.log(
      `🔍 Employee search for "${q}" returned ${result.rows.length} results`,
    );

    res.json({
      success: true,
      employees: result.rows,
    });
  } catch (error) {
    console.error("❌ Employee search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error searching employees",
    });
  }
};

module.exports = {
  // Admin Dashboard
  getDashboard,
  editUser,
  deleteUser,
  searchEmployees,
};