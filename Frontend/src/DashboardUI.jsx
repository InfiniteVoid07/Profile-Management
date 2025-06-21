// DashboardUI.jsx
import React from 'react';
import "./DashboardUI.css";

const DashboardUI = ({
  loading,
  error,
  currentUser,
  dashboardData,
  showEditModal,
  showDeleteModal,
  showEmployeeEditModal,
  showEmployeeDeleteModal,
  editFormData,
  employeeFormData,
  formLoading,
  selectedFile,
  previewUrl,
  selectedEmployee,
  uploadingToCloudinary,
  onError,
  onEditModalClose,
  onDeleteModalClose,
  onEmployeeEditModalClose,
  onEmployeeDeleteModalClose,
  onFormSubmit,
  onEmployeeFormSubmit,
  onInputChange,
  onEmployeeInputChange,
  onFileSelect,
  onDeleteAccount,
  onDeleteEmployee,
  getImageUrl
}) => {
  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Show error state
  if (error && !currentUser) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => onError("")}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button className="close-banner" onClick={() => onError("")}>
            ✕
          </button>
        </div>
      )}

      {/* Admin Dashboard Data Section */}
      {currentUser?.user_type === "admin" && dashboardData && (
        <div className="stats-section">
          <h3 className="section-title">
            <span>👑</span>
            Admin Dashboard
          </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">
                {dashboardData.stats?.totalAdmins || 0}
              </div>
              <div className="stat-label">Total Admins</div>
              <div className="stat-icon">👑</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {dashboardData.stats?.totalEmployees || 0}
              </div>
              <div className="stat-label">Total Employees</div>
              <div className="stat-icon">👥</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {dashboardData.stats?.totalUsers || 0}
              </div>
              <div className="stat-label">Total Users</div>
              <div className="stat-icon">🌟</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {dashboardData.stats?.activeToday || 0}
              </div>
              <div className="stat-label">Active Today</div>
              <div className="stat-icon">🔥</div>
            </div>
          </div>

          {/* Recent Activity */}
          {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
            <div className="activity-section">
              <h4 className="activity-title">📋 Recent Activity</h4>
              <div className="activity-list">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === "login" ? "🔐" : 
                       activity.type === "register" ? "👤" : 
                       activity.type === "update" ? "✏️" : "📝"}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        {activity.message}
                      </div>
                      <div className="activity-time">
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-icon">✏️</div>
                <h3 className="modal-title">Edit Profile</h3>
              </div>
              <button className="modal-close" onClick={onEditModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={onFormSubmit} className="modern-form">
                {/* Profile Picture Section */}
                <div className="profile-picture-section">
                  <div className="current-avatar">
                    {(previewUrl || editFormData.profile_pic_url) ? (
                      <img 
                        src={previewUrl || getImageUrl(editFormData.profile_pic_url)} 
                        alt="Profile" 
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="upload-controls">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileSelect}
                      className="file-input-hidden"
                      id="profile-picture-input"
                    />
                    <label htmlFor="profile-picture-input" className="upload-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      {selectedFile ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    {selectedFile && (
                      <span className="file-status">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={editFormData.first_name || ''}
                      onChange={onInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={editFormData.last_name || ''}
                      onChange={onInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email_id"
                      value={editFormData.email_id || ''}
                      onChange={onInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={editFormData.phone_number || ''}
                      onChange={onInputChange}
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={editFormData.age || ''}
                      onChange={onInputChange}
                      min="1"
                      max="120"
                      className="form-input"
                      placeholder="Enter age"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      value={editFormData.gender || ''}
                      onChange={onInputChange}
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {currentUser?.user_type === "employee" && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          name="department"
                          value={editFormData.department || ''}
                          onChange={onInputChange}
                          className="form-input"
                          placeholder="Enter department"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Job Role</label>
                        <input
                          type="text"
                          name="role"
                          value={editFormData.role || ''}
                          onChange={onInputChange}
                          className="form-input"
                          placeholder="Enter job role"
                        />
                      </div>
                    </>
                  )}
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onEditModalClose}
                disabled={formLoading || uploadingToCloudinary}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                onClick={onFormSubmit}
                disabled={formLoading || uploadingToCloudinary}
              >
                {formLoading || uploadingToCloudinary ? (
                  <>
                    <div className="button-spinner"></div>
                    {uploadingToCloudinary ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-icon danger">🗑️</div>
                <h3 className="modal-title">Delete Account</h3>
              </div>
              <button className="modal-close" onClick={onDeleteModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-container">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h4>This action cannot be undone!</h4>
                  <p>Are you sure you want to delete your account?</p>
                  <p>All your data will be permanently removed from our system.</p>
                </div>
              </div>
              
              <div className="user-info">
                <img 
                  src={getImageUrl(currentUser?.profile_pic_url)} 
                  alt="Profile" 
                  className="delete-user-avatar"
                />
                <div className="user-details">
                  <strong>{currentUser?.first_name} {currentUser?.last_name}</strong>
                  <br />
                  <span>{currentUser?.email_id}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={onDeleteModalClose}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={onDeleteAccount}
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <div className="button-spinner"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete My Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEmployeeEditModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content modern-modal">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-icon">✏️</div>
                <h3 className="modal-title">Edit Employee</h3>
              </div>
              <button className="modal-close" onClick={onEmployeeEditModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="employee-info-header">
                <img 
                  src={getImageUrl(selectedEmployee.profile_pic_url)} 
                  alt="Employee" 
                  className="employee-avatar"
                />
                <div>
                  <h4>{selectedEmployee.first_name} {selectedEmployee.last_name}</h4>
                  <p>{selectedEmployee.email_id}</p>
                </div>
              </div>

              <form onSubmit={onEmployeeFormSubmit} className="modern-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={employeeFormData.first_name || ''}
                      onChange={onEmployeeInputChange}
                      required
                      className="form-input"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={employeeFormData.last_name || ''}
                      onChange={onEmployeeInputChange}
                      required
                      className="form-input"
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email_id"
                      value={employeeFormData.email_id || ''}
                      onChange={onEmployeeInputChange}
                      required
                      className="form-input"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={employeeFormData.phone_number || ''}
                      onChange={onEmployeeInputChange}
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={employeeFormData.age || ''}
                      onChange={onEmployeeInputChange}
                      min="1"
                      max="120"
                      className="form-input"
                      placeholder="Enter age"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      value={employeeFormData.gender || ''}
                      onChange={onEmployeeInputChange}
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={employeeFormData.department || ''}
                      onChange={onEmployeeInputChange}
                      className="form-input"
                      placeholder="Enter department"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Role</label>
                    <input
                      type="text"
                      name="role"
                      value={employeeFormData.role || ''}
                      onChange={onEmployeeInputChange}
                      className="form-input"
                      placeholder="Enter job role"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onEmployeeEditModalClose}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                onClick={onEmployeeFormSubmit}
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <div className="button-spinner"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Update Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Employee Modal */}
      {showEmployeeDeleteModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-icon danger">🗑️</div>
                <h3 className="modal-title">Delete Employee</h3>
              </div>
              <button className="modal-close" onClick={onEmployeeDeleteModalClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-container">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h4>This action cannot be undone!</h4>
                  <p>Are you sure you want to delete this employee?</p>
                  <p>All employee data will be permanently removed.</p>
                </div>
              </div>
              
              <div className="user-info">
                <img 
                  src={getImageUrl(selectedEmployee.profile_pic_url)} 
                  alt="Profile" 
                  className="delete-user-avatar"
                />
                <div className="user-details">
                  <strong>
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </strong>
                  <br />
                  <span>{selectedEmployee.email_id}</span>
                  <br />
                  <small>{selectedEmployee.department} - {selectedEmployee.role}</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={onEmployeeDeleteModalClose}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => onDeleteEmployee(selectedEmployee.id)}
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <div className="button-spinner"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Employee'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardUI;