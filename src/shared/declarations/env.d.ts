/// <reference types="vite/client" />

// Electron Forge + Vite specific environment variables
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string | undefined;

declare module "electron-squirrel-startup" {
  const started: boolean;
  export default started;
}
