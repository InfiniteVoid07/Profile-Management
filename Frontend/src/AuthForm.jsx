// Authform.jsx
import React, { useState } from "react";
import { useAuthForm } from "./AuthFormFunc";
import { AuthFormUI } from "./AuthFormUI";
import "./AuthForm.css";

const AuthForm = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
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
    handleTabClick
  } = useAuthForm({
    isSignup,
    setIsSignup,
    showPassword,
    setShowPassword,
    onLoginSuccess
  });

  const uiProps = {
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
  };

  return <AuthFormUI {...uiProps} />;
};

export default AuthForm;