# Mobile Shell (Capacitor)

This is the Capacitor project that wraps the FlatFlow PWA for Android and iOS native apps.

## ✅ Phase 3: Capacitor Integration Complete

The Capacitor configuration is ready! Follow the setup instructions below.

## Quick Start

1. **Install dependencies:**
   ```bash
   cd apps/mobile-shell
   pnpm install
   ```

2. **Build the web app:**
   ```bash
   # From project root:
   pnpm build
   ```

3. **Add platforms:**
   ```bash
   cd apps/mobile-shell
   npx cap add android
   npx cap add ios  # macOS only
   ```

4. **Sync web assets:**
   ```bash
   npx cap sync
   ```

5. **Open in native IDEs:**
   ```bash
   npx cap open android  # Opens Android Studio
   npx cap open ios      # Opens Xcode (macOS only)
   ```

## Configuration

The Capacitor config is in `capacitor.config.ts`:

- **appId**: `com.flatflow.app` (Android package / iOS bundle ID)
- **appName**: `FlatFlow`
- **webDir**: `../../apps/web/dist` (monorepo path to built web assets)
- **bundledWebRuntime**: `false` (uses web app's runtime)

## Scripts

- `pnpm sync` - Sync web assets to native projects
- `pnpm open:android` - Open Android project in Android Studio
- `pnpm open:ios` - Open iOS project in Xcode
- `pnpm build:android` - Build web app + sync to Android
- `pnpm build:ios` - Build web app + sync to iOS

## Detailed Setup

See **[CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md)** for comprehensive setup instructions, troubleshooting, and development workflow.

## Current Status

✅ Capacitor config configured  
✅ Dependencies installed  
✅ Plugin configurations (SplashScreen, StatusBar, Keyboard, etc.)  
⏳ Platforms ready to add (run `npx cap add android` and `npx cap add ios`)  
⏳ Native apps ready to build after platforms are added

