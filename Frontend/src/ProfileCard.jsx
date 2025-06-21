// ProfileCard.jsx
import React from 'react';
import "./ProfileCard.css";

const ProfileCard = ({
  currentUser,
  stats,
  getImageUrl,
  onEditProfile,
  onDeleteAccount,
  onSettings,
  onViewProfile,
  onLogout
}) => {
  if (!currentUser) return null;

  // Prepare info items based on user data
  const infoItems = [
    { label: "Email Address", value: currentUser.email_id, icon: "📧" },
    { label: "Phone Number", value: currentUser.phone_number, icon: "📱" },
    { label: "Gender", value: currentUser.gender, icon: "👤" },
    { label: "Age", value: currentUser.age + " years", icon: "🎂" },
  ];

  // Add role-specific info
  if (currentUser.user_type === "employee") {
    infoItems.push(
      { label: "Department", value: currentUser.department, icon: "🏢" },
      { label: "Job Role", value: currentUser.role, icon: "💼" },
    );
  } else {
    infoItems.push(
      { label: "User Type", value: "Administrator", icon: "👑" },
      { label: "Access Level", value: "Full Access", icon: "🔓" },
    );
  }

  return (
    <div className="profile-section">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-logo">🏢 Company Dashboard</div>
        <div className="user-actions">
          <button className="btn-secondary" onClick={onEditProfile}>
            ✏️ Edit Profile
          </button>
          <button className="btn-secondary" onClick={onSettings}>
            ⚙️ Settings
          </button>
          <button className="btn-danger" onClick={onDeleteAccount}>
            🗑️ Delete Account
          </button>
          <button className="btn-primary" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Profile Card - FIXED: Added edit picture button */}
        <div className="profile-card">
          <div className="profile-pic-container">
            <img
              className="profile-pic"
              src={getImageUrl(currentUser.profile_pic_url)}
              alt="Profile Picture"
              onError={(e) => {
                e.target.src = "https://res.cloudinary.com/dpplrxoko/image/upload/v1750463195/panda_upyqmw.jpg";
              }}
            />
            <button 
              className="edit-picture-btn" 
              onClick={onEditProfile}
              title="Edit Profile Picture"
            >
              📷
            </button>
          </div>
          <h2 className="user-name">
            {currentUser.first_name} {currentUser.last_name}
          </h2>
          <div
            className={`role-badge ${
              currentUser.user_type === "admin" ? "admin-badge" : "employee-badge"
            }`}
          >
            {currentUser.user_type === "admin"
              ? "👑 Administrator"
              : `💼 ${currentUser.role || "Employee"}`}
          </div>
          <p className="user-email">{currentUser.email_id}</p>
          <button className="btn-primary" onClick={onViewProfile}>
            📋 View Full Profile
          </button>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3 className="section-title">
            <span>📊</span>
            Personal Information
          </h3>
          <div className="info-grid">
            {infoItems.map((item, index) => (
              <div key={index} className="info-item">
                <div className="info-label">
                  {item.icon} {item.label}
                </div>
                <div className="info-value">
                  {item.value || "Not specified"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h3 className="section-title">
          <span>📈</span>
          Quick Stats
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.loginCount}</div>
            <div className="stat-label">Total Logins</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.daysActive}</div>
            <div className="stat-label">Days Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.lastLogin}</div>
            <div className="stat-label">Last Login</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.accountAge}</div>
            <div className="stat-label">Account Age</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3 className="section-title">
          <span>⚡</span>
          Quick Actions
        </h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={onEditProfile}>
            <div className="quick-action-icon">✏️</div>
            <div className="quick-action-text">Edit Profile</div>
            <div className="quick-action-desc">
              Update your personal information and profile picture
            </div>
          </button>
          <button className="quick-action-card" onClick={onSettings}>
            <div className="quick-action-icon">⚙️</div>
            <div className="quick-action-text">Settings</div>
            <div className="quick-action-desc">Manage your preferences</div>
          </button>
          <button className="quick-action-card" onClick={onViewProfile}>
            <div className="quick-action-icon">👁️</div>
            <div className="quick-action-text">View Profile</div>
            <div className="quick-action-desc">
              See your complete profile
            </div>
          </button>
          {currentUser.user_type === "admin" && (
            <button
              className="quick-action-card"
              onClick={() => alert("User management coming soon!")}
            >
              <div className="quick-action-icon">👥</div>
              <div className="quick-action-text">Manage Users</div>
              <div className="quick-action-desc">
                Add, edit, or remove users
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;