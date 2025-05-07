# Tired Eyes

An Electron application for reminding users to take regular eye breaks.

## Project Structure

This project follows an industry-standard structure for Electron applications with React:

```
src/
├── main/             # Electron main process code
│   └── main.ts       # Main entry point for the Electron app
├── preload/          # Preload scripts for secure IPC
│   └── preload.ts    # Bridge between main and renderer
├── renderer/         # Frontend React application
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React contexts for state management
│   ├── pages/        # Page components
│   ├── styles/       # CSS and style files
│   └── index.tsx     # Entry point for React
└── shared/           # Code shared between processes
    └── types/        # TypeScript type definitions
```

## Development

```bash
# Install dependencies
npm install

# Start the app in development mode
npm start

# Package the app
npm run package

# Create distributables
npm run make

# Publish
npm run publish
```

## Paths and Imports

The project uses TypeScript path aliases for cleaner imports:

- `@main/*` - Main process code
- `@preload/*` - Preload scripts
- `@renderer/*` - Renderer process (React) code
- `@shared/*` - Shared code between processes

Example: `import { AppSettings } from '@shared/types';`

## Configuration

The project uses:

- Vite for bundling and development server
- Electron Forge for building and packaging
- React for the UI
- TailwindCSS for styling
- TypeScript for type safety

## Features

- Customizable work and break durations
- Multiple notification types:
  - Normal system notifications
  - Full-screen break reminders
  - Screen locking for enforced breaks
- Persistent settings across app restarts
- Cross-platform (macOS, Windows, Linux)
- Modern interface with TailwindCSS v4

### Prerequisites

- Node.js 16+ and npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

### Troubleshooting

If you encounter issues with TailwindCSS, ensure you have the correct packages installed:

```
npm install @tailwindcss/postcss
```

Also, make sure your postcss.config.js is properly configured:

```js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

## License

MIT
