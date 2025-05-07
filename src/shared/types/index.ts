/**
 * Common type definitions for the application
 */
import { BrowserWindow } from "electron";

export interface AppSettings {
  notificationType: "normal" | "fullscreen";
  breakDuration: number; // in seconds
  workDuration: number; // in minutes
  theme: "light" | "dark" | "system"; // Theme preference
}

export interface ElectronAPI {
  showNotification: (options: NotificationOptions) => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  getSettings: () => Promise<AppSettings>;
  isBreakWindow: () => boolean;
  getSystemTheme: () => Promise<"light" | "dark">;
}

export interface BreakData {
  getDuration: () => Promise<number>;
  closeBreakWindow: () => Promise<boolean>;
}

export interface NotificationOptions {
  type: "normal" | "fullscreen";
  message: string;
  duration: number;
}

// BrowserWindow extension for break window properties
export interface BreakWindowProps {
  breakDuration?: number;
  isBreakWindow?: boolean;
}

// Extend the BrowserWindow to include our custom properties
export type ExtendedBrowserWindow = BrowserWindow & BreakWindowProps;

// Extend the Window interface in the global namespace
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    breakData: BreakData;
  }
}
