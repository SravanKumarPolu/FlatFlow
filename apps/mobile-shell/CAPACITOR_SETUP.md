# Capacitor Setup Instructions (Phase 3)

This document provides step-by-step instructions for setting up Capacitor to build Android and iOS apps from the FlatFlow PWA.

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** >= 18.0.0 installed
- ✅ **pnpm** >= 8.0.0 installed (project uses pnpm workspace)
- ✅ Web app built successfully (`pnpm build` in root works)
- ✅ **Android Studio** installed (for Android development)
- ✅ **Xcode** installed (for iOS development, macOS only)

## Project Structure

```
FlatFlow/
├── apps/
│   ├── web/              # Vite + React app (source)
│   │   └── dist/         # Built web assets (generated)
│   └── mobile-shell/     # Capacitor wrapper
│       ├── capacitor.config.ts
│       ├── android/      # Android project (generated)
│       └── ios/          # iOS project (generated)
```

## Installation Commands

### Step 1: Install Capacitor Dependencies

From the **project root**, run:

```bash
# Install Capacitor core and CLI (if not already installed)
cd apps/mobile-shell
pnpm install

# Or from root:
pnpm --filter mobile-shell install
```

**Note:** Dependencies are already listed in `apps/mobile-shell/package.json`:
- `@capacitor/core` - Core Capacitor runtime
- `@capacitor/cli` - Capacitor CLI tools
- `@capacitor/android` - Android platform support
- `@capacitor/ios` - iOS platform support
- Additional plugins: `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar`

### Step 2: Build the Web App

Before adding platforms, ensure the web app is built:

```bash
# From project root:
pnpm build

# This will build the web app to apps/web/dist
```

### Step 3: Add Android Platform

```bash
cd apps/mobile-shell

# Add Android platform (creates android/ directory)
npx cap add android
```

**What this does:**
- Creates `apps/mobile-shell/android/` directory
- Sets up Android Gradle project
- Configures native Android app to load web assets

### Step 4: Add iOS Platform

```bash
# From apps/mobile-shell:
npx cap add ios
```

**What this does:**
- Creates `apps/mobile-shell/ios/` directory
- Sets up Xcode project
- Configures native iOS app to load web assets

**Note:** iOS setup requires macOS and Xcode.

### Step 5: Sync Web Assets

After building the web app, sync the assets to native projects:

```bash
# From apps/mobile-shell:
npx cap sync
```

**What this does:**
- Copies `apps/web/dist/` contents to native projects
- Updates native project configurations
- Installs any missing Capacitor plugins

**Tip:** Run `cap sync` after every web app build before testing on devices.

## Configuration

### Capacitor Config

The configuration is in `apps/mobile-shell/capacitor.config.ts`:

```typescript
{
  appId: "com.flatflow.app",           // Android package name / iOS bundle ID
  appName: "FlatFlow",                  // App display name
  webDir: "../../apps/web/dist",        // Path to built web assets
  bundledWebRuntime: false,             // Use web app's runtime
}
```

**Customization:**
- Change `appId` to your own domain (e.g., `com.yourname.flatflow`)
- Update `appName` if needed
- Adjust `webDir` if your build output changes

### Development vs Production

**Production (bundled):**
- Leave `server` config commented out
- Native app loads web assets from `webDir`
- Works offline after initial load

**Development (remote server):**
- Uncomment `server` config:
  ```typescript
  server: {
    url: "http://localhost:3000",
    cleartext: true,
  },
  ```
- Native app loads from dev server
- Enables hot reload during development
- **Note:** Use ngrok/tunneling for real device testing

## Building & Running

### Android

#### Using Android Studio:

```bash
# Open Android project
npx cap open android
```

**In Android Studio:**
1. Wait for Gradle sync to complete
2. Select a device/emulator from toolbar
3. Click Run ▶️ button

#### Using Command Line:

```bash
# Build and install on connected device
cd apps/mobile-shell/android
./gradlew installDebug

# Or create APK
./gradlew assembleDebug
# APK will be in: android/app/build/outputs/apk/debug/
```

#### Build Scripts:

From `apps/mobile-shell`:
```bash
# Build web app + sync to Android
pnpm build:android

# Or manually:
pnpm --filter web build && npx cap sync android
```

### iOS

#### Using Xcode:

```bash
# Open iOS project
npx cap open ios
```

**In Xcode:**
1. Select your development team in project settings
2. Select a simulator or connected device
3. Click Run ▶️ button

#### Build Scripts:

From `apps/mobile-shell`:
```bash
# Build web app + sync to iOS
pnpm build:ios

# Or manually:
pnpm --filter web build && npx cap sync ios
```

## Development Workflow

### Typical Development Cycle:

1. **Make changes** to web app in `apps/web/src/`
2. **Build web app:**
   ```bash
   pnpm build
   ```
3. **Sync to native:**
   ```bash
   cd apps/mobile-shell
   npx cap sync
   ```
4. **Test in native app:**
   - Android: `npx cap open android`
   - iOS: `npx cap open ios`

### Using Remote Dev Server (Optional):

For faster iteration during development:

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Update capacitor.config.ts:**
   ```typescript
   server: {
     url: "http://YOUR_IP:3000", // Your machine's local IP
     cleartext: true,
   },
   ```

3. **Sync:**
   ```bash
   npx cap sync
   ```

4. **Run app** - it will load from dev server

**Note:** Use ngrok or similar for device testing:
```bash
ngrok http 3000
# Use the ngrok URL in server.url
```

## Troubleshooting

### Web assets not updating?

- Always run `npx cap sync` after building
- Check that `apps/web/dist` exists and has content
- Clear native build caches:
  - Android: `./gradlew clean` in `android/`
  - iOS: Clean build folder in Xcode (Cmd+Shift+K)

### Build errors?

- Ensure Node.js version is >= 18
- Ensure all dependencies installed: `pnpm install` in root
- Check Capacitor version compatibility
- Review native project logs in Android Studio/Xcode

### App shows blank screen?

- Verify `webDir` path is correct in `capacitor.config.ts`
- Check that web app builds successfully
- Look at native console logs for errors
- Verify service worker isn't interfering (check browser DevTools in native)

### iOS build fails?

- Ensure Xcode Command Line Tools installed: `xcode-select --install`
- Check CocoaPods: `cd ios && pod install`
- Verify signing certificates in Xcode

## Next Steps

After setup:
1. ✅ Test on Android emulator/device
2. ✅ Test on iOS simulator/device
3. ✅ Configure app icons and splash screens
4. ✅ Set up app signing (for store releases)
5. ✅ Test offline functionality
6. ✅ Prepare for Play Store / App Store submission

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Setup Guide](https://capacitorjs.com/docs/android)
- [iOS Setup Guide](https://capacitorjs.com/docs/ios)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

---

**Status:** Phase 3 Setup Complete ✅

The Capacitor configuration is ready. Follow the installation commands above to add platforms and start building native apps.

