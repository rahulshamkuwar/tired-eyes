import React, { useState, useEffect } from "react";
import TimerPage from "../pages/TimerPage";
import SettingsPage from "../pages/SettingsPage";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<"timer" | "settings">("timer");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up observer for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Styles
  const rootStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: isDarkMode ? "#111827" : "#f0f7fa",
    color: isDarkMode ? "#f7fafc" : "#333",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    boxShadow: isDarkMode
      ? "0 2px 4px rgba(0, 0, 0, 0.2)"
      : "0 2px 4px rgba(0, 0, 0, 0.05)",
    borderBottom: isDarkMode ? "1px solid #334155" : "1px solid #e1eff5",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  };

  const navLinkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: isDarkMode ? "#e2e8f0" : "#4b5563",
    fontWeight: 500,
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    transition: "background-color 0.15s ease",
  };

  const navLinkActiveStyle: React.CSSProperties = {
    ...navLinkStyle,
    backgroundColor: isDarkMode
      ? "rgba(96, 165, 250, 0.2)"
      : "rgba(90, 175, 203, 0.1)",
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "0 1rem",
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    padding: "1rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: isDarkMode ? "#94a3b8" : "#6b7280",
    borderTop: isDarkMode ? "1px solid #334155" : "1px solid #e1eff5",
  };

  const themeButtonStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? "#334155" : "#e1eff5",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    color: isDarkMode ? "#e2e8f0" : "#4b5563",
    fontSize: "1.25rem",
    marginLeft: "0.5rem",
    width: "2.5rem",
    height: "2.5rem",
  };

  const iconStyle: React.CSSProperties = {
    width: "1.5rem",
    height: "1.5rem",
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div style={rootStyle}>
      <header style={headerStyle}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 style={logoStyle}>Tired Eyes</h1>
          <nav style={navStyle}>
            <button
              style={
                currentPage === "timer" ? navLinkActiveStyle : navLinkStyle
              }
              onClick={() => setCurrentPage("timer")}
            >
              Timer
            </button>
            <button
              style={
                currentPage === "settings" ? navLinkActiveStyle : navLinkStyle
              }
              onClick={() => setCurrentPage("settings")}
            >
              Settings
            </button>
            <button
              style={themeButtonStyle}
              onClick={toggleDarkMode}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <SunIcon style={iconStyle} />
              ) : (
                <MoonIcon style={iconStyle} />
              )}
            </button>
          </nav>
        </div>
      </header>

      <main style={mainStyle}>
        {currentPage === "timer" ? <TimerPage /> : <SettingsPage />}
      </main>

      <footer style={footerStyle}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          Tired Eyes - Take care of your vision
        </div>
      </footer>
    </div>
  );
};

export default App;
