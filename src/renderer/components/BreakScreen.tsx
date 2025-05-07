import React, { useState, useEffect } from "react";
// We don't need to import and use the useTheme hook here
// Dark mode classes will work automatically via ThemeProvider

interface BreakScreenProps {
  duration: number;
}

const BreakScreen: React.FC<BreakScreenProps> = ({ duration }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(duration);
  const [timerComplete, setTimerComplete] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode
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

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimerComplete(true);
          // Auto-close after additional 5 seconds
          setTimeout(() => {
            window.breakData.closeBreakWindow();
          }, 5000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCloseClick = () => {
    if (timerComplete) {
      window.breakData.closeBreakWindow();
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    margin: 0,
    padding: 0,
    backgroundColor: isDarkMode ? "#111827" : "#f0f7fa",
    color: isDarkMode ? "#f7fafc" : "#333",
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    transition: "all 0.2s ease",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    textAlign: "center",
    padding: "1.5rem",
    background: isDarkMode
      ? "linear-gradient(to bottom, #111827, #1e293b)"
      : "linear-gradient(to bottom, #f0f7fa, #f5f3ff)",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: 500,
    marginBottom: "1.5rem",
    color: isDarkMode ? "#93c5fd" : "#5aafcb", // Brighter blue in dark mode
  };

  const timerStyle: React.CSSProperties = {
    fontSize: "4rem",
    fontWeight: 700,
    margin: "2rem 0",
    color: isDarkMode ? "#93c5fd" : "#5aafcb", // Brighter blue in dark mode
    fontVariantNumeric: "tabular-nums",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    lineHeight: 1.625,
    marginBottom: "2rem",
    maxWidth: "42rem",
    color: isDarkMode ? "#e2e8f0" : "#495057", // Lighter text for dark mode
  };

  const cardStyle: React.CSSProperties = {
    marginTop: "2rem",
    padding: "1.5rem",
    backgroundColor: isDarkMode
      ? "rgba(30, 41, 59, 0.9)"
      : "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(4px)",
    maxWidth: "42rem",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: "0.75rem",
    boxShadow: isDarkMode
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: isDarkMode ? "1px solid #334155" : "1px solid #e1eff5",
  };

  const cardHeadingStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 500,
    marginBottom: "1rem",
    color: isDarkMode ? "#93c5fd" : "#5aafcb", // Brighter blue in dark mode
  };

  const listStyle: React.CSSProperties = {
    textAlign: "left",
    paddingLeft: "1.5rem",
    lineHeight: 1.625,
    color: isDarkMode ? "#e2e8f0" : "#495057", // Lighter text for dark mode
  };

  const listItemStyle: React.CSSProperties = {
    marginBottom: "0.75rem",
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: "2rem",
    padding: "0.75rem 2rem",
    borderRadius: "9999px",
    fontSize: "1.25rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
    backgroundColor: timerComplete
      ? isDarkMode
        ? "#60a5fa" // Brighter blue button in dark mode
        : "#5aafcb"
      : isDarkMode
      ? "#334155" // Darker disabled button
      : "#d1d5db",
    color: timerComplete ? "white" : isDarkMode ? "#94a3b8" : "#6b7280",
    cursor: timerComplete ? "pointer" : "not-allowed",
    border: "none",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Time to rest your eyes</h1>

        <div style={timerStyle}>{formatTime(secondsRemaining)}</div>

        <p style={descriptionStyle}>
          Look away from your screen and focus on something at least 20 feet
          away for the duration of your break.
        </p>

        <div style={cardStyle}>
          <h2 style={cardHeadingStyle}>Eye Care Tips</h2>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              Follow the 20-20-20 rule: every 20 minutes, look at something 20
              feet away for 20 seconds.
            </li>
            <li style={listItemStyle}>
              Blink frequently to keep your eyes moist.
            </li>
            <li style={listItemStyle}>
              Adjust your screen so it's at arm's length and slightly below eye
              level.
            </li>
            <li style={listItemStyle}>
              Use proper lighting to reduce eye strain.
            </li>
          </ul>
        </div>

        <button
          style={buttonStyle}
          disabled={!timerComplete}
          onClick={handleCloseClick}
        >
          {timerComplete ? "Continue" : "Continue (Wait for timer)"}
        </button>
      </div>
    </div>
  );
};

export default BreakScreen;
