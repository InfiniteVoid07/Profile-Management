// ======================== LoadingScreen.jsx ========================
import React from "react";
import "./App.css";

export default function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="background-gradient">
        <div className="floating-orb1"></div>
        <div className="floating-orb2"></div>
        <div className="floating-orb3"></div>
      </div>
      <div className="loading-card">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading application...</div>
        <div className="loading-subtext">
          Please wait while we prepare everything for you
        </div>
      </div>
    </div>
  );
}