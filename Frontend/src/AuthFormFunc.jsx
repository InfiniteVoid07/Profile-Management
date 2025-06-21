// AuthFormFunc.jsx
import { useState } from "react";
import "./AuthForm.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const INITIAL_FORM_STATE = {
  email: "",
  username: "",
  password: "",
  userType: "employee",
  lastName: "",
  phoneNumber: "",
  gender: "",
  age: "",
  department: "",
  role: "",
};

export const useAuthForm = ({ 
  isSignup, 
  setIsSignup, 
  showPassword, 
  setShowPassword, 
  onLoginSuccess 
}) => {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form handlers
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleUserTypeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      userType: e.target.value,
      department: "",
      role: "",
    }));
    setError("");
  };

  // File upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed for profile pictures.");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setProfilePicture(file);
    createPreviewUrl(file);
    setError("");
  };

  const createPreviewUrl = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicturePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    const fileInput = document.getElementById("profilePicture");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Validation helpers
  const validateLoginForm = () => {
    if (!form.email || !form.password) {
      setError("⚠️ Email and password are required");
      return false;
    }
    return true;
  };

  const validateSignupForm = () => {
    const requiredFields = [
      "email",
      "username", 
      "password",
      "lastName",
      "phoneNumber",
      "gender",
      "age",
    ];

    if (form.userType === "employee") {
      requiredFields.push("department", "role");
    }

    const missingFields = requiredFields.filter((field) => !form[field]);
    if (missingFields.length > 0) {
      setError("⚠️ Please fill in all required fields");
      return false;
    }
    return true;
  };

  // API calls
  const performLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: form.email, 
          password: form.password 
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Network error. Please check your connection and try again.");
    }
  };

  const performSignup = async () => {
    try {
      const formData = createSignupFormData();
      
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        alert(`✅ ${data.message}`);
        
        resetForm();
        
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError("Network error. Please check your connection and try again.");
    }
  };

  const createSignupFormData = () => {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(form).forEach(key => {
      if (form[key]) {
        formData.append(key, form[key]);
      }
    });

    // Add profile picture if exists
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    return formData;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!isSignup) {
        if (validateLoginForm()) {
          await performLogin();
        }
      } else {
        if (validateSignupForm()) {
          await performSignup();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // UI handlers
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleTabClick = (signupTab) => {
    setIsSignup(signupTab);
    resetForm();
  };

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setError("");
  };

  return {
    form,
    profilePicture,
    profilePicturePreview,
    loading,
    error,
    handleChange,
    handleUserTypeChange,
    handleFileChange,
    removeProfilePicture,
    handleSubmit,
    togglePasswordVisibility,
    handleTabClick,
  };
};