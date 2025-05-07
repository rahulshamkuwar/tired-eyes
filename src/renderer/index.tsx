import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import BreakScreen from "./components/BreakScreen";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/index.css";
import "@shared/types"; // This ensures the Window interface extension is included

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// Check if we're in a break window using the query parameter
const isBreakWindow = window.electronAPI.isBreakWindow();

if (isBreakWindow) {
  // Initialize with a default value
  let breakDuration = 20;

  // Get the break duration from the main process
  window.breakData
    .getDuration()
    .then((duration) => {
      breakDuration = duration;
      renderBreakScreen(breakDuration);
    })
    .catch(() => {
      // If there's an error, use the default duration
      renderBreakScreen(breakDuration);
    });
} else {
  // Render the main application
  renderMainApp();
}

function renderBreakScreen(duration: number) {
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <BreakScreen duration={duration} />
      </ThemeProvider>
    </React.StrictMode>
  );
}

function renderMainApp() {
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
