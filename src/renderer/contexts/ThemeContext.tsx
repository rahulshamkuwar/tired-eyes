import React, { createContext, useContext, useEffect, useState } from "react";
import { AppSettings } from "../../shared/types";

type Theme = "light" | "dark";
type ThemeContextType = {
  theme: Theme;
  themePreference: AppSettings["theme"];
  setThemePreference: (theme: AppSettings["theme"]) => void;
};

// Create context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  themePreference: "system",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setThemePreference: () => {}, // Default no-op function that will be replaced with actual implementation
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [themePreference, setThemePreference] =
    useState<AppSettings["theme"]>("system");

  // Apply theme to document - only runs when theme changes
  useEffect(() => {
    const applyTheme = (newTheme: Theme) => {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setTheme(newTheme);
    };

    const updateTheme = async () => {
      try {
        // Get user's settings
        if (window.electronAPI) {
          const settings = await window.electronAPI.getSettings();
          setThemePreference(settings.theme);

          if (settings.theme === "system") {
            // Use system preference
            const systemTheme = await window.electronAPI.getSystemTheme();
            applyTheme(systemTheme);
          } else {
            // Use user preference
            applyTheme(settings.theme as Theme);
          }
        }
      } catch (error) {
        console.error("Error updating theme:", error);
        // Default to light if there's an error
        applyTheme("light");
      }
    };

    // Initial theme load
    updateTheme();

    // Set up event listener for system theme changes
    // This will update the theme if the user's system theme changes
    // and they're using the "system" theme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themePreference === "system") {
        applyTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Listen for storage events to update theme when settings change in another window/tab
    const handleStorageChange = () => updateTheme();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [themePreference]);

  // Handle theme preference change - memoize the function to prevent unnecessary re-renders
  const handleThemeChange = React.useCallback(
    async (newThemePreference: AppSettings["theme"]) => {
      try {
        if (window.electronAPI) {
          const settings = await window.electronAPI.getSettings();

          // Update with new theme preference
          const updatedSettings = {
            ...settings,
            theme: newThemePreference,
          };

          // Save updated settings
          await window.electronAPI.saveSettings(updatedSettings);
          setThemePreference(newThemePreference);

          // Trigger storage event for other components
          window.dispatchEvent(new Event("storage"));
        }
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    },
    []
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      theme,
      themePreference,
      setThemePreference: handleThemeChange,
    }),
    [theme, themePreference, handleThemeChange]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
