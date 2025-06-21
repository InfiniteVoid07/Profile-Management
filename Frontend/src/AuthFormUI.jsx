// AuthFormUI.jsx
import React from "react";
import "./AuthForm.css";

// Component: Floating Background Orbs
const FloatingOrbs = () => (
  <div className="auth-background-gradient">
    <div className="auth-floating-orb-1"></div>
    <div className="auth-floating-orb-2"></div>
    <div className="auth-floating-orb-3"></div>
  </div>
);

// Component: Header Section
const AuthHeader = ({ isSignup }) => (
  <div className="auth-header">
    <h1 className="auth-title">Welcome Back</h1>
    <p className="auth-subtitle">
      {isSignup
        ? "Create your account to get started"
        : "Sign in to continue your journey"}
    </p>
  </div>
);

// Component: Error Message
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="auth-error-message">
      <span className="auth-error-icon">⚠️</span>
      {error}
    </div>
  );
};

// Component: Tab Navigation
const TabNavigation = ({ isSignup, handleTabClick }) => (
  <div className="auth-tab-container">
    <button
      onClick={() => handleTabClick(false)}
      className={`auth-tab ${!isSignup ? 'active' : 'inactive'}`}
    >
      <span className="auth-tab-text">Login</span>
    </button>
    <button
      onClick={() => handleTabClick(true)}
      className={`auth-tab ${isSignup ? 'active' : 'inactive'}`}
    >
      <span className="auth-tab-text">Sign Up</span>
    </button>
    <div className={`auth-tab-indicator ${isSignup ? 'signup' : ''}`}></div>
  </div>
);

// Component: Input Field with Icon
const InputField = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  disabled = false,
  icon,
  focused = false,
  min,
  max
}) => (
  <div className="auth-input-group">
    <div className={`auth-input-container ${focused ? 'focused' : ''}`}>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className="auth-input"
        min={min}
        max={max}
      />
      <div className="auth-input-icon">{icon}</div>
    </div>
  </div>
);

// Component: Select Field with Icon
const SelectField = ({
  name,
  value,
  onChange,
  disabled = false,
  icon,
  required = false,
  children
}) => (
  <div className="auth-input-group">
    <div className="auth-input-container">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="auth-select"
        required={required}
      >
        {children}
      </select>
      <div className="auth-input-icon">{icon}</div>
    </div>
  </div>
);

// Component: Password Field
const PasswordField = ({
  name,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  required,
  disabled,
  showPassword,
  togglePasswordVisibility,
  focused
}) => (
  <div className="auth-input-group">
    <div className={`auth-input-container ${focused ? 'focused' : ''}`}>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className="auth-input"
      />
      <div className="auth-input-icon">🔒</div>
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="auth-eye-button"
        tabIndex={-1}
      >
        {showPassword ? "🙈" : "👁️"}
      </button>
    </div>
  </div>
);

// Component: File Upload Section
const ProfilePictureUpload = ({
  profilePicturePreview,
  profilePicture,
  handleFileChange,
  removeProfilePicture,
  loading
}) => (
  <div className="auth-input-group">
    <div className="auth-file-upload-container">
      <label htmlFor="profilePicture" className="auth-file-upload-button">
        <span>📷</span>
        <span>Choose Profile Picture (Optional)</span>
      </label>
      <input
        id="profilePicture"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        className="auth-hidden-file-input"
      />

      {profilePicturePreview && (
        <div className="auth-preview-container">
          <img
            src={profilePicturePreview}
            alt="Preview"
            className="auth-preview-image"
          />
          <div className="auth-preview-info">
            <div>{profilePicture?.name}</div>
            <div>
              {(profilePicture?.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <button
            type="button"
            onClick={removeProfilePicture}
            className="auth-remove-button"
            disabled={loading}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  </div>
);

// Component: Demo Info Section
const DemoInfo = ({ isSignup }) => {
  if (isSignup) return null;
  
  return (
    <div className="auth-demo-info">
      <p className="auth-demo-text">
        Use your database credentials to login
      </p>
    </div>
  );
};

// Component: Footer Section
const AuthFooter = ({ isSignup, handleTabClick, loading }) => (
  <div className="auth-footer">
    <p className="auth-footer-text">
      {isSignup ? "Already have an account?" : "New to our platform?"}
    </p>
    <button
      type="button"
      onClick={() => handleTabClick(!isSignup)}
      className="auth-link-button"
      disabled={loading}
    >
      {isSignup ? "Sign in instead" : "Create an account"}
    </button>
  </div>
);

// Component: Submit Button
const SubmitButton = ({ isSignup, loading, form }) => (
  <button
    type="submit"
    disabled={loading}
    className={`auth-submit-button ${loading ? 'disabled' : ''} ${isSignup ? 'signup' : 'login'}`}
  >
    <span className="auth-button-text">
      {loading
        ? "⏳ Processing..."
        : isSignup
          ? `✨ Create ${form.userType === "admin" ? "Admin" : "Employee"} Account`
          : "🚀 Sign In"}
    </span>
  </button>
);

// Main UI Component
export const AuthFormUI = ({
  isSignup,
  form,
  profilePicture,
  profilePicturePreview,
  focusedField,
  loading,
  error,
  showPassword,
  setFocusedField,
  handleChange,
  handleUserTypeChange,
  handleFileChange,
  removeProfilePicture,
  handleSubmit,
  togglePasswordVisibility,
  handleTabClick
}) => {
  // Helper function to create focus handlers for input fields
  const createFocusHandlers = (fieldName) => ({
    onFocus: () => setFocusedField(fieldName),
    onBlur: () => setFocusedField(""),
    focused: focusedField === fieldName
  });

  return (
    <div className="auth-page-container">
      <FloatingOrbs />

      <div className="auth-container">
        <div className="auth-card">
          <AuthHeader isSignup={isSignup} />
          
          <ErrorMessage error={error} />

          <TabNavigation 
            isSignup={isSignup} 
            handleTabClick={handleTabClick} 
          />

          <form onSubmit={handleSubmit} className="auth-form">
            {/* User Type Selection - Only show during signup */}
            {isSignup && (
              <SelectField
                name="userType"
                value={form.userType}
                onChange={handleUserTypeChange}
                disabled={loading}
                icon="🏢"
              >
                <option value="employee">👨‍💼 Employee</option>
                <option value="admin">👑 Admin</option>
              </SelectField>
            )}

            {/* Email */}
            <InputField
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              icon="📧"
              {...createFocusHandlers("email")}
            />

            {/* First Name (Username) for signup */}
            {isSignup && (
              <InputField
                type="text"
                name="username"
                placeholder="Enter your first name"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                icon="👤"
                {...createFocusHandlers("username")}
              />
            )}

            {/* Last Name for signup */}
            {isSignup && (
              <InputField
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={form.lastName}
                onChange={handleChange}
                required
                disabled={loading}
                icon="👥"
                {...createFocusHandlers("lastName")}
              />
            )}

            {/* Password */}
            <PasswordField
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
              {...createFocusHandlers("password")}
            />

            {/* Additional signup fields */}
            {isSignup && (
              <>
                {/* Phone Number */}
                <InputField
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter your phone number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  icon="📱"
                  {...createFocusHandlers("phoneNumber")}
                />

                {/* Gender */}
                <SelectField
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={loading}
                  icon="⚧️"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </SelectField>

                {/* Age */}
                <InputField
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  value={form.age}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  icon="🎂"
                  min="18"
                  max="100"
                  {...createFocusHandlers("age")}
                />

                {/* Department and Role - Only for employees */}
                {form.userType === "employee" && (
                  <>
                    <InputField
                      type="text"
                      name="department"
                      placeholder="Enter your department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      icon="🏢"
                      {...createFocusHandlers("department")}
                    />

                    <InputField
                      type="text"
                      name="role"
                      placeholder="Enter your role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      icon="💼"
                      {...createFocusHandlers("role")}
                    />
                  </>
                )}

                {/* Profile Picture Upload */}
                <ProfilePictureUpload
                  profilePicturePreview={profilePicturePreview}
                  profilePicture={profilePicture}
                  handleFileChange={handleFileChange}
                  removeProfilePicture={removeProfilePicture}
                  loading={loading}
                />
              </>
            )}

            {/* Submit Button */}
            <SubmitButton 
              isSignup={isSignup} 
              loading={loading} 
              form={form} 
            />
          </form>

          <DemoInfo isSignup={isSignup} />

          <AuthFooter 
            isSignup={isSignup} 
            handleTabClick={handleTabClick} 
            loading={loading} 
          />
        </div>
      </div>
    </div>
  );
};