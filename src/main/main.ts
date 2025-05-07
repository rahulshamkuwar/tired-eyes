import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  screen,
  nativeTheme,
  Tray,
  Menu,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import Store from "electron-store";
import {
  AppSettings,
  NotificationOptions,
  ExtendedBrowserWindow,
} from "../shared/types";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Define app windows
let mainWindow: BrowserWindow | null = null;
let breakWindow: ExtendedBrowserWindow | null = null;
let tray: Tray | null = null;
let isAppQuitting = false;

// Define default settings
const defaultSettings: AppSettings = {
  notificationType: "normal",
  breakDuration: 20,
  workDuration: 20,
  theme: "system", // Default to system theme
  closeToTray: true, // Default to close to tray
};

// Create the settings store
const settingsStore = new Store<AppSettings>({
  defaults: defaultSettings,
  name: "tired-eyes-settings",
});

// Track the last notification to prevent duplicates
let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN = 500; // ms

// Apply theme settings
const applyTheme = () => {
  const settings = settingsStore.store;
  if (settings.theme === "dark") {
    nativeTheme.themeSource = "dark";
  } else if (settings.theme === "light") {
    nativeTheme.themeSource = "light";
  } else {
    nativeTheme.themeSource = "system";
  }
};

// Create the tray icon
const createTray = () => {
  // Get the appropriate icon based on platform
  let iconPath: string;

  if (process.platform === "darwin") {
    // macOS - use template icon (must be a black-and-white icon ending with 'Template')
    iconPath = path.join(__dirname, "../../assets/trayIcon.png");
  } else if (process.platform === "win32") {
    // Windows - use ICO
    iconPath = path.join(__dirname, "../../assets/trayIcon.ico");
  } else {
    // Linux - use PNG
    iconPath = path.join(__dirname, "../../assets/trayIcon.png");
  }

  // Create tray
  tray = new Tray(iconPath);

  // Set tooltip
  tray.setToolTip("Tired Eyes");

  // Create right-click menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        if (!mainWindow) {
          createWindow();
        } else {
          mainWindow.show();
        }
      },
    },
    {
      label: "Settings",
      click: () => {
        if (!mainWindow) {
          createWindow();
        }
        mainWindow?.show();
        mainWindow?.webContents.send("navigate-to-settings");
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  // Set the context menu
  tray.setContextMenu(contextMenu);

  // Clicking on the tray icon should open the app
  tray.on("click", () => {
    if (!mainWindow) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../build/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Tired Eyes",
    show: false,
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  // Handle close event
  mainWindow.on("close", (event) => {
    const settings = settingsStore.store;

    // If closeToTray is enabled and app is not quitting, prevent default behavior
    if (settings.closeToTray && !isAppQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      return false;
    }

    return true;
  });
};

// Create a fullscreen break window
const createBreakWindow = (duration: number) => {
  // Check if a break window is already open
  if (breakWindow) {
    return; // Prevent creating multiple break windows
  }

  // Get the primary display size
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create a new window that covers the entire screen
  breakWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "../build/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  }) as ExtendedBrowserWindow;

  // Track when the window is closed
  breakWindow.on("closed", () => {
    breakWindow = null;
  });

  // Add the duration as a global variable that can be accessed by preload
  // Using a safer type extension approach
  breakWindow.breakDuration = duration;
  breakWindow.isBreakWindow = true;

  // For development
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    breakWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}?isBreak=true`);

    // Open dev tools if in development mode
    if (process.env.NODE_ENV === "development") {
      breakWindow.webContents.openDevTools();
    }
  } else {
    // For production
    breakWindow.loadFile(
      path.join(
        __dirname,
        `../../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      ),
      { query: { isBreak: "true" } }
    );
  }

  // Set a timeout to auto-close the window after the duration + 5 seconds (failsafe)
  setTimeout(() => {
    if (breakWindow) {
      breakWindow.close();
    }
  }, (duration + 5) * 1000);
};

// Show a normal notification
const showNormalNotification = (message: string) => {
  const now = Date.now();
  console.log("now", now);
  // Prevent duplicate notifications sent within a short time window
  if (now - lastNotificationTime < NOTIFICATION_COOLDOWN) {
    console.log("Suppressing duplicate notification");
    return;
  }

  // Update last notification time
  lastNotificationTime = now;

  // Create notification object
  const notification = new Notification({
    title: "Tired Eyes",
    body: message,
    silent: false, // Ensure sound is not suppressed
  });

  // Show the notification (only once)
  notification.show();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  createTray();
  applyTheme();
});

// Store quitting state
app.on("before-quit", () => {
  isAppQuitting = true;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle IPC messages from the renderer process
ipcMain.handle("show-notification", (_, options: NotificationOptions) => {
  // Ensure only one notification mechanism is used
  switch (options.type) {
    case "fullscreen":
      // For fullscreen notifications, create a break window
      createBreakWindow(options.duration);
      break;
    case "normal":
    default:
      // For normal notifications, use Electron's Notification API
      showNormalNotification(options.message);
      break;
  }

  // Return success to prevent any additional notification attempts
  return true;
});

// Handle settings IPC
ipcMain.handle("save-settings", (_, settings: AppSettings) => {
  settingsStore.set(settings);

  // Apply theme when settings are saved
  applyTheme();

  return true;
});

ipcMain.handle("get-settings", () => {
  const settings = settingsStore.store;
  return settings;
});

// Handle break window IPC
ipcMain.handle("get-break-duration", (event) => {
  // Get the sender window
  const win = BrowserWindow.fromWebContents(
    event.sender
  ) as ExtendedBrowserWindow;
  // Return the break duration
  if (win && win.breakDuration) {
    return win.breakDuration;
  }
  // Default value if not set
  return 20;
});

ipcMain.handle("close-break-window", (event) => {
  // Get the sender window
  const win = BrowserWindow.fromWebContents(event.sender);
  // Close it if it exists
  if (win && win === breakWindow) {
    win.close();
    return true;
  }
  return false;
});

// Handle theme detection
ipcMain.handle("get-system-theme", () => {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
});
