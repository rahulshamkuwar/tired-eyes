import { AppSettings } from "../../shared/types";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";

const SettingsPage: React.FC = () => {
  const { themePreference, setThemePreference } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    notificationType: "normal",
    breakDuration: 20, // 20 seconds minimum
    workDuration: 20, // 20 minutes by default
    theme: themePreference, // Use current theme from ThemeContext
    closeToTray: true, // Default to closing to tray
  });

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

  // Load settings from storage when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to use Electron API if available
        if (window.electronAPI) {
          const savedSettings = await window.electronAPI.getSettings();
          if (savedSettings) {
            setSettings(savedSettings);
          }
        } else {
          // Fallback to localStorage in browser environments
          const savedSettings = localStorage.getItem("tired-eyes-settings");
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Save settings when they change
  const saveSettings = async () => {
    try {
      // Try to use Electron API if available
      if (window.electronAPI) {
        await window.electronAPI.saveSettings(settings);
      } else {
        // Fallback to localStorage
        localStorage.setItem("tired-eyes-settings", JSON.stringify(settings));
      }

      // Update theme preference in context
      if (settings.theme !== themePreference) {
        setThemePreference(settings.theme);
      }

      // Trigger a storage event so other components can update
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // Convert numeric values
    if (name === "breakDuration" || name === "workDuration") {
      parsedValue = parseInt(value, 10);
    }

    setSettings((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
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
    justifyContent: "start",
    maxWidth: "48rem",
    margin: "0 auto",
    height: "100%",
  };

  const cardStyle: React.CSSProperties = {
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
  };

  const headerStyle: React.CSSProperties = {
    fontSize: "1.75rem",
    fontWeight: 500,
    marginBottom: "1.5rem",
    textAlign: "center",
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
  };

  const subheaderStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 500,
    marginBottom: "1rem",
    marginTop: "1.5rem",
    color: isDarkMode ? "#93c5fd" : "#5aafcb",
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: "1.25rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: 500,
    color: isDarkMode ? "#e2e8f0" : "#4b5563",
  };

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    border: isDarkMode ? "1px solid #4b5563" : "1px solid #d1d5db",
    backgroundColor: isDarkMode ? "#374151" : "#ffffff",
    color: isDarkMode ? "#f7fafc" : "#333",
    transition: "all 0.2s ease",
  };

  const selectStyle: React.CSSProperties = {
    ...inputBaseStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 0.5rem center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1.5em 1.5em",
    paddingRight: "2.5rem",
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0.5rem 0",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: isDarkMode ? "#60a5fa" : "#5aafcb",
    color: "white",
    width: "100%",
  };

  const infoTextStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: isDarkMode ? "#94a3b8" : "#6b7280",
    marginTop: "0.5rem",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={headerStyle}>Settings</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSettings();
          }}
          style={cardStyle}
        >
          <h2 style={subheaderStyle}>Timer Settings</h2>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Notification Type</label>
            <select
              name="notificationType"
              value={settings.notificationType}
              onChange={handleChange}
              style={selectStyle}
            >
              <option value="normal">Normal Notification</option>
              <option value="fullscreen">Full Screen Notification</option>
            </select>
            <p style={infoTextStyle}>
              Choose how intrusive the break notifications should be
            </p>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Break Duration (seconds)</label>
            <input
              type="number"
              name="breakDuration"
              min="20"
              value={settings.breakDuration}
              onChange={handleChange}
              style={inputBaseStyle}
            />
            <p style={infoTextStyle}>
              How long each break should last (minimum 20 seconds)
            </p>
          </div>

          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>Work Duration (minutes)</label>
            <input
              type="number"
              name="workDuration"
              min="1"
              value={settings.workDuration}
              onChange={handleChange}
              style={inputBaseStyle}
            />
            <p style={infoTextStyle}>How long to work before taking a break</p>
          </div>

          <h2 style={subheaderStyle}>Application Settings</h2>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Theme</label>
            <select
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              style={selectStyle}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
            <p style={infoTextStyle}>Choose your preferred app theme</p>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>When Closing the Window</label>
            <select
              name="closeToTray"
              value={settings.closeToTray.toString()}
              onChange={(e) => {
                setSettings((prev) => ({
                  ...prev,
                  closeToTray: e.target.value === "true",
                }));
              }}
              style={selectStyle}
            >
              <option value="true">Minimize to Tray</option>
              <option value="false">Exit Application</option>
            </select>
            <p style={infoTextStyle}>
              Choose what happens when you close the application window
            </p>
          </div>

          <button type="submit" style={primaryButtonStyle}>
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
