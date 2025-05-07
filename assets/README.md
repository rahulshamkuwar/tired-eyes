# Tray Icons

This directory contains the SVG source for the application's tray icon. You'll need to convert this SVG to platform-specific formats:

## Required Icon Formats

1. **macOS**: PNG format named `trayIconTemplate.png` (16x16, 32x32 recommended)

   - For macOS, use a black and white icon with the filename ending in "Template"
   - This allows macOS to automatically adjust for dark/light modes

2. **Windows**: ICO format named `trayIcon.ico` (16x16, 32x32 recommended)

   - Windows ICO files should contain multiple resolutions

3. **Linux**: PNG format named `trayIcon.png` (24x24 recommended)

## Converting SVG to Required Formats

You can use tools like:

- **Inkscape**: Open the SVG and export to PNG at different sizes
- **ImageMagick**: Convert between formats
- **Online converters**: Various online tools can convert SVG to ICO/PNG

### Example Commands

Convert SVG to PNG (for macOS and Linux):

```bash
# Using Inkscape CLI
inkscape trayIcon.svg --export-filename=trayIconTemplate.png --export-width=16 --export-height=16

# For Linux version
inkscape trayIcon.svg --export-filename=trayIcon.png --export-width=24 --export-height=24
```

Convert SVG to ICO (for Windows):

```bash
# Using ImageMagick to create ICO with multiple sizes
convert -background transparent trayIcon.svg -define icon:auto-resize=16,24,32,48,64 trayIcon.ico
```

Place the converted icons in this directory for the application to use them.
