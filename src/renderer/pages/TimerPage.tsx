import React, { useState, useEffect, useCallback } from "react";
import { AppSettings } from "../../shared/types";

const TimerPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    notificationType: "normal",
    breakDuration: 20,
    workDuration: 20,
    theme: "system",
  });

  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track last notification to prevent duplicates
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  const NOTIFICATION_COOLDOWN = 500; // ms

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

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to use Electron API if available
        if (window.electronAPI) {
          const savedSettings = await window.electronAPI.getSettings();
          if (savedSettings) {
            setSettings(savedSettings);

            // Reset timer if we're not on a break
            if (!isBreak) {
              setTimeLeft(savedSettings.workDuration * 60);
            }
          }
        } else {
          // Fallback to localStorage in browser environments
          const savedSettings = localStorage.getItem("tired-eyes-settings");
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);

            // Reset timer if we're not on a break
            if (!isBreak) {
              setTimeLeft(parsed.workDuration * 60);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();

    // Setup event listener for settings changes
    window.addEventListener("storage", loadSettings);
    return () => {
      window.removeEventListener("storage", loadSettings);
    };
  }, [isBreak]);

  // Timer logic
  useEffect(() => {
    if (isPaused) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          // If work period ended, show a notification
          if (!isBreak) {
            showNotification();
            setIsBreak(true);
            return settings.breakDuration;
          } else {
            // If break period ended, start a new work period
            setIsBreak(false);
            return settings.workDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isPaused, isBreak, settings]);

  // Show notification to take a break
  const showNotification = useCallback(() => {
    const now = Date.now();
    if (now - lastNotificationTime < NOTIFICATION_COOLDOWN) {
      return; // Prevent duplicates
    }

    setLastNotificationTime(now);

    try {
      if (window.electronAPI) {
        // Use Electron notification
        window.electronAPI.showNotification({
          type: settings.notificationType,
          message: "Time to take a break!",
          duration: settings.breakDuration,
        });
      } else {
        // Fallback to browser notification
        if (Notification.permission === "granted") {
          new Notification("Tired Eyes", {
            body: "Time to take a break!",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Tired Eyes", {
                body: "Time to take a break!",
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }, [settings, lastNotificationTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Skip to break
  const handleSkipToBreak = () => {
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(settings.breakDuration);
      showNotification();
    }
  };

  // Reset timer
  const handleReset = () => {
    if (isBreak) {
      setTimeLeft(settings.breakDuration);
    } else {
      setTimeLeft(settings.workDuration * 60);
    }
    setIsPaused(false);
  };

  // Toggle pause/resume
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    margin: 0,
    padding: "2rem 1rem",
    backgroundColor: isDarkMode ? "#111827" : "#f0f7fa",
    color: isDarkMode ? "#f7fafc" : "#333",
    fontFamily: "'Inter', sans-serif",
    minHeight: "calc(100vh - 10rem)", // Account for header and footer
    transition: "all 0.2s ease",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "start",
    maxWidth: "48rem",
    margin: "0 auto",
    height: "100%",
  };

  const timerCardStyle: React.CSSProperties = {
    width: "100%",
    padding: "2rem",
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    color: isDarkMode ? "#f7fafc" : "#333",
    borderRadius: "0.75rem",
    boxShadow: isDarkMode
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    marginBottom: "1.5rem",
    border: isDarkMode ? "1px solid #334155" : "1px solid #e1eff5",
    transition: "all 0.2s ease",
  };

  const headerStyle: React.CSSProperties = {
    fontSize: "1.75rem",
    fontWeight: 500,
    marginBottom: "1.5rem",
    textAlign: "center",
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
  };

  const timerStyle: React.CSSProperties = {
    fontSize: "5rem",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: "2rem",
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
    fontVariantNumeric: "tabular-nums",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    borderRadius: "9999px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: isDarkMode ? "#60a5fa" : "#5aafcb",
    color: "white",
    minWidth: "120px",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: isDarkMode ? "#8b5cf6" : "#7c5cf6",
    color: "white",
    minWidth: "120px",
  };

  const accentButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: isDarkMode ? "#475569" : "#667b87",
    color: "white",
    minWidth: "120px",
  };

  const skipButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: isDarkMode ? "#312e81" : "#c9b8fe",
    color: isDarkMode ? "#c4b5fd" : "#392c74",
    width: "100%",
    marginTop: "1rem",
  };

  const progressContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "10px",
    backgroundColor: isDarkMode ? "#334155" : "#e1eff5",
    borderRadius: "9999px",
    marginBottom: "1.5rem",
    overflow: "hidden",
  };

  const progressBarStyle: React.CSSProperties = {
    height: "100%",
    backgroundColor: isDarkMode ? "#60a5fa" : "#5aafcb",
    borderRadius: "9999px",
    transition: "width 0.5s ease",
    width: `${Math.round((timeLeft / (settings.workDuration * 60)) * 100)}%`,
  };

  const sessionInfoStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "2rem",
    color: isDarkMode ? "#e2e8f0" : "#495057",
    fontSize: "1.125rem",
  };

  const focusHistoryStyle: React.CSSProperties = {
    width: "100%",
    padding: "1.5rem",
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    color: isDarkMode ? "#f7fafc" : "#333",
    borderRadius: "0.75rem",
    boxShadow: isDarkMode
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: isDarkMode ? "1px solid #334155" : "1px solid #e1eff5",
  };

  const historyHeaderStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 500,
    marginBottom: "1rem",
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
  };

  const historyListStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={timerCardStyle}>
          <h2 style={headerStyle}>{isBreak ? "Break Time" : "Work Time"}</h2>
          <p style={sessionInfoStyle}>
            {isBreak
              ? "Rest your eyes for a moment"
              : "Focus on your work until the next break"}
          </p>

          <div style={timerStyle}>{formatTime(timeLeft)}</div>

          <div style={buttonContainerStyle}>
            <button
              onClick={handlePauseResume}
              style={isPaused ? secondaryButtonStyle : primaryButtonStyle}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button onClick={handleReset} style={accentButtonStyle}>
              Reset
            </button>
            {!isBreak && (
              <button onClick={handleSkipToBreak} style={skipButtonStyle}>
                Skip to Break
              </button>
            )}
          </div>
        </div>

        <div style={progressContainerStyle}>
          <div style={progressBarStyle}></div>
        </div>

        <p style={sessionInfoStyle}>{isBreak ? "Break" : "Work"}</p>
      </div>

      <div style={focusHistoryStyle}>
        <h3 style={historyHeaderStyle}>Focus History</h3>
        <ul style={historyListStyle}>{/* Add history items here */}</ul>
      </div>
    </div>
  );
};

export default TimerPage;
