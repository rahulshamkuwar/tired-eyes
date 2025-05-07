// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { AppSettings, NotificationOptions } from "../shared/types";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Send a notification from the renderer to the main process
  showNotification: (options: NotificationOptions) => {
    return ipcRenderer.invoke("show-notification", options);
  },

  // Store settings in electron-store
  saveSettings: (settings: AppSettings) => {
    return ipcRenderer.invoke("save-settings", settings);
  },

  // Get settings from electron-store
  getSettings: () => {
    return ipcRenderer.invoke("get-settings") as Promise<AppSettings>;
  },

  // Check if this is a break window
  isBreakWindow: () => {
    return new URLSearchParams(window.location.search).has("isBreak");
  },

  // Get system theme (light or dark)
  getSystemTheme: () => {
    return ipcRenderer.invoke("get-system-theme") as Promise<"light" | "dark">;
  },

  // Add an event listener for navigation events from the main process
  onNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on("navigate-to-settings", () => callback("/settings"));

    // Return a cleanup function
    return () => {
      ipcRenderer.removeAllListeners("navigate-to-settings");
    };
  },
});

// Access to window.breakData in the renderer process
contextBridge.exposeInMainWorld("breakData", {
  // Get the break duration specified by the main process
  getDuration: () => {
    return ipcRenderer.invoke("get-break-duration");
  },

  // Close the break window
  closeBreakWindow: () => {
    return ipcRenderer.invoke("close-break-window");
  },
});
