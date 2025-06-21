// ======================== App.jsx ========================
import React, { useState, useEffect } from "react";
import AuthForm from "./AuthForm";
import Dashboard from "./Dashboard";
import LoadingScreen from "./loadingScreen";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("currentUser");

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          setCurrentUser({ ...userData, token });
          setAuthToken(token);
          setIsAuthenticated(true);
          window.authToken = token;
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          window.authToken = null;
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = (user, token) => {
    const userWithToken = { ...user, token };
    setCurrentUser(userWithToken);
    setAuthToken(token);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.authToken = token;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.authToken = null;
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      {isAuthenticated ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
