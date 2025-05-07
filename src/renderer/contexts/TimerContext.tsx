import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { AppSettings } from "../../shared/types";

interface TimerContextType {
  timeLeft: number;
  isBreak: boolean;
  isPaused: boolean;
  settings: AppSettings;
  setIsPaused: (paused: boolean) => void;
  handleSkipToBreak: () => void;
  handleReset: () => void;
  handlePauseResume: () => void;
  formatTime: (seconds: number) => string;
}

const defaultSettings: AppSettings = {
  notificationType: "normal",
  breakDuration: 20,
  workDuration: 20,
  theme: "system",
  closeToTray: true,
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const settingsRef = useRef<AppSettings>(defaultSettings);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isInitialLoadRef = useRef(true);

  // Track last notification to prevent duplicates
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  const NOTIFICATION_COOLDOWN = 500; // ms

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to use Electron API if available
        if (window.electronAPI) {
          const savedSettings = await window.electronAPI.getSettings();
          if (savedSettings) {
            setSettings(savedSettings);
            settingsRef.current = savedSettings;

            // Only reset timer on initial load - not when settings change later
            if (isInitialLoadRef.current) {
              setTimeLeft(savedSettings.workDuration * 60);
              isInitialLoadRef.current = false;
            }
          }
        } else {
          // Fallback to localStorage in browser environments
          const savedSettings = localStorage.getItem("tired-eyes-settings");
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);
            settingsRef.current = parsed;

            // Only reset timer on initial load - not when settings change later
            if (isInitialLoadRef.current) {
              setTimeLeft(parsed.workDuration * 60);
              isInitialLoadRef.current = false;
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
  }, []);

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
          type: settingsRef.current.notificationType,
          message: "Time to take a break!",
          duration: settingsRef.current.breakDuration,
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
  }, [lastNotificationTime]);

  // Timer logic
  useEffect(() => {
    if (isPaused) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // If work period ended, show a notification
          if (!isBreak) {
            showNotification();
            setIsBreak(true);
            return settingsRef.current.breakDuration;
          } else {
            // If break period ended, start a new work period
            setIsBreak(false);
            return settingsRef.current.workDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isPaused, isBreak, showNotification]);

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
      setTimeLeft(settingsRef.current.breakDuration);
      showNotification();
    }
  };

  // Reset timer
  const handleReset = () => {
    if (isBreak) {
      setTimeLeft(settingsRef.current.breakDuration);
    } else {
      setTimeLeft(settingsRef.current.workDuration * 60);
    }
    setIsPaused(false);
  };

  // Toggle pause/resume
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const value = {
    timeLeft,
    isBreak,
    isPaused,
    settings,
    setIsPaused,
    handleSkipToBreak,
    handleReset,
    handlePauseResume,
    formatTime,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
