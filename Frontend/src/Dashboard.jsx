// Dashboard.jsx
import React, { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import EmployeeSearch from "./EmployeeSearch";
import DashboardUI from "./DashboardUI";
import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_URL  || "http://localhost:5000";

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: 'dpplrxoko',
  uploadPreset: 'FullStackproj',
  folder: 'profile_pictures',
  defaultImage: 'https://res.cloudinary.com/dpplrxoko/image/upload/v1750463195/panda_upyqmw.jpg'
};

export default function Dashboard({ user, onLogout }) {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    loginCount: 0,
    daysActive: 0,
    lastLogin: "Today",
    accountAge: "0Y",
  });

  // Employee search states
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmployeeEditModal, setShowEmployeeEditModal] = useState(false);
  const [showEmployeeDeleteModal, setShowEmployeeDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [employeeFormData, setEmployeeFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingToCloudinary, setUploadingToCloudinary] = useState(false);

  // Authentication helper
  const getAuthToken = () => {
    return window.authToken;
  };

  // API request helper
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        ...(!(options.body instanceof FormData) && {
          "Content-Type": "application/json",
        }),
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  };

  // Cloudinary image upload
  const uploadToCloudinary = async (file) => {
    setUploadingToCloudinary(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error:', errorData);
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Cloudinary upload success:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    } finally {
      setUploadingToCloudinary(false);
    }
  };

  // Get optimized image URL from Cloudinary - FIXED
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'null' || imagePath === 'undefined' || imagePath === '') {
      return CLOUDINARY_CONFIG.defaultImage;
    }
    
    // If it's already a full Cloudinary URL, return as is
    if (imagePath.startsWith('https://res.cloudinary.com/')) {
      return imagePath;
    }
    
    // If it's a full HTTP URL but not Cloudinary, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, construct the full API URL
    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Default fallback
    return CLOUDINARY_CONFIG.defaultImage;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/auth/profile");
      return response.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/dashboard");
      return response.data;
    } catch (error) {
      if (error.message.includes("Access denied")) {
        return null;
      }
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  // File selection handler - FIXED
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError(""); // Clear any previous errors

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update user profile with Cloudinary - FIXED
  const updateUserProfile = async (updatedData) => {
    try {
      setFormLoading(true);
      setError("");

      let profilePictureUrl = updatedData.profile_pic_url;

      // Upload to Cloudinary if new file selected
      if (selectedFile) {
        console.log('Uploading file to Cloudinary...');
        profilePictureUrl = await uploadToCloudinary(selectedFile);
        updatedData.profile_pic_url = profilePictureUrl;
        console.log('New profile picture URL:', profilePictureUrl);
      }

      const response = await makeAuthenticatedRequest(
        `/api/users/${currentUser.user_type}/${currentUser.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(updatedData),
        }
      );

      // Update the current user state immediately with the new data
      const updatedUser = { ...response.user, profile_pic_url: profilePictureUrl };
      setCurrentUser(updatedUser);
      setEditFormData(updatedUser);
      
      setShowEditModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);

      alert("Profile updated successfully!");
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user account
  const deleteUserAccount = async () => {
    try {
      setFormLoading(true);
      await makeAuthenticatedRequest(
        `/api/users/${currentUser.user_type}/${currentUser.id}`,
        { method: "DELETE" }
      );

      alert("Account deleted successfully");
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setError(error.message || "Failed to delete account");
      alert("Error deleting account: " + (error.message || "Unknown error"));
    } finally {
      setFormLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Search employees
  const searchEmployees = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await makeAuthenticatedRequest(
        `/api/employees/search?q=${encodeURIComponent(searchTerm)}`,
        { method: "GET" }
      );
      setSearchResults(response.employees || []);
    } catch (error) {
      console.error("Error searching employees:", error);
      setError("Failed to search employees");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setEmployeeSearch(value);

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchEmployees(value);
    }, 500);
  };

  // Employee management functions
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeFormData({ ...employee });
    setShowEmployeeEditModal(true);
  };

  const updateEmployee = async (employeeId, updatedData) => {
    try {
      setFormLoading(true);
      const response = await makeAuthenticatedRequest(
        `/api/users/employee/${employeeId}`,
        {
          method: "PATCH",
          body: JSON.stringify(updatedData),
        }
      );

      setSearchResults((prev) =>
        prev.map((emp) => (emp.id === employeeId ? response.user : emp))
      );

      setShowEmployeeEditModal(false);
      setError("");
      alert("Employee updated successfully!");
      return response.user;
    } catch (error) {
      console.error("Error updating employee:", error);
      setError(error.message || "Failed to update employee");
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      setFormLoading(true);
      await makeAuthenticatedRequest(`/api/users/employee/${employeeId}`, {
        method: "DELETE",
      });

      setSearchResults((prev) => prev.filter((emp) => emp.id !== employeeId));
      setShowEmployeeDeleteModal(false);
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError(error.message || "Failed to delete employee");
      alert("Error deleting employee: " + (error.message || "Unknown error"));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await makeAuthenticatedRequest("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout API error:", error);
      }

      if (onLogout) {
        onLogout();
      } else {
        window.location.href = "/";
      }
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(editFormData);
    } catch (error) {
      // Error handled in updateUserProfile
    }
  };

  const handleEmployeeFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEmployee(selectedEmployee.id, employeeFormData);
    } catch (error) {
      // Error handled in updateEmployee
    }
  };

  // Profile actions
  const handleEditProfile = () => {
    setEditFormData({ ...currentUser });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(""); // Clear any previous errors
    setShowEditModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleSettings = () => {
    alert("Settings functionality - would open settings modal or page");
  };

  const handleViewProfile = () => {
    alert("View Full Profile - would show detailed profile information");
  };

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        let userData = user;
        if (!userData) {
          userData = await fetchUserProfile();
        }

        setCurrentUser(userData);
        setEditFormData(userData);

        if (userData && userData.user_type === "admin") {
          try {
            const dashData = await fetchDashboardData();
            setDashboardData(dashData);
          } catch (error) {
            console.warn("Could not fetch dashboard data:", error.message);
          }
        }

        setStats({
          loginCount: Math.floor(Math.random() * 100) + 20,
          daysActive: Math.floor(Math.random() * 300) + 50,
          lastLogin: "Today",
          accountAge: (Math.random() * 3 + 0.5).toFixed(1) + "Y",
        });
      } catch (error) {
        console.error("Dashboard initialization error:", error);
        setError(error.message || "Failed to load dashboard");

        if (
          error.message.includes("token") ||
          error.message.includes("authentication")
        ) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user]);

  // Props for child components
  const profileCardProps = {
    currentUser,
    stats,
    getImageUrl,
    onEditProfile: handleEditProfile,
    onDeleteAccount: handleDeleteAccount,
    onSettings: handleSettings,
    onViewProfile: handleViewProfile,
    onLogout: handleLogout
  };

  const employeeSearchProps = {
    employeeSearch,
    searchResults,
    searchLoading,
    selectedEmployee,
    onSearchChange: handleSearchChange,
    onEditEmployee: handleEditEmployee,
    onDeleteEmployee: (employee) => {
      setSelectedEmployee(employee);
      setShowEmployeeDeleteModal(true);
    },
    getImageUrl,
    isAdmin: currentUser?.user_type === "admin"
  };

  const dashboardUIProps = {
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
    onError: setError,
    onEditModalClose: () => {
      setShowEditModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setError("");
    },
    onDeleteModalClose: () => setShowDeleteModal(false),
    onEmployeeEditModalClose: () => setShowEmployeeEditModal(false),
    onEmployeeDeleteModalClose: () => setShowEmployeeDeleteModal(false),
    onFormSubmit: handleFormSubmit,
    onEmployeeFormSubmit: handleEmployeeFormSubmit,
    onInputChange: handleInputChange,
    onEmployeeInputChange: handleEmployeeInputChange,
    onFileSelect: handleFileSelect,
    onDeleteAccount: deleteUserAccount,
    onDeleteEmployee: deleteEmployee,
    getImageUrl
  };

  // FIXED: Reordered components - Employee search now comes after profile and admin details
  return (
    <div className="dashboard-container">
      <ProfileCard {...profileCardProps} />
      <DashboardUI {...dashboardUIProps} />
      <EmployeeSearch {...employeeSearchProps} />
    </div>
  );
}