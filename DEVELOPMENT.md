# Development Workflow

This document explains the development workflows for FlatFlow across web, PWA, and native platforms.

## Project Structure

```
FlatFlow/
├── apps/
│   ├── web/              # Vite + React + TypeScript web app
│   │   └── dist/         # Built web assets (output)
│   └── mobile-shell/     # Capacitor native wrapper
│       ├── android/      # Android native project (created by `cap add android`)
│       └── ios/          # iOS native project (created by `cap add ios`)
```

## Web Development

### Development Server

```bash
# Start Vite dev server with hot reload
pnpm dev

# Opens at http://localhost:3000
# Hot Module Replacement (HMR) enabled
# Service worker disabled in dev mode
```

### Build & Preview

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Opens at http://localhost:4173 (or next available port)
```

## Capacitor Development

### Initial Setup (One-Time)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build web app:**
   ```bash
   pnpm build
   ```

3. **Add Android platform:**
   ```bash
   cd apps/mobile-shell
   npx cap add android
   ```
   This creates `apps/mobile-shell/android/` folder with native Android project.

4. **Add iOS platform (macOS only):**
   ```bash
   cd apps/mobile-shell
   npx cap add ios
   ```
   This creates `apps/mobile-shell/ios/` folder with native iOS project.

### Development Workflow

**Typical development cycle:**

1. **Make changes** to web app in `apps/web/src/`

2. **Build web app:**
   ```bash
   pnpm build
   ```
   This builds to `apps/web/dist/`

3. **Sync to native projects:**
   ```bash
   pnpm cap:sync
   # Or: cd apps/mobile-shell && npx cap sync
   ```
   This copies `apps/web/dist/` to native projects and updates configurations.

4. **Open in native IDE:**
   ```bash
   # Android
   pnpm cap:android
   # Or: cd apps/mobile-shell && npx cap open android
   
   # iOS (macOS only)
   pnpm cap:ios
   # Or: cd apps/mobile-shell && npx cap open ios
   ```

5. **Run from IDE:**
   - Android Studio: Click Run ▶️ button
   - Xcode: Click Run ▶️ button

### Build & Sync Scripts

**From project root:**

```bash
# Build web app + sync to Capacitor (all platforms)
pnpm cap:build

# Sync only (after manual build)
pnpm cap:sync

# Open Android Studio
pnpm cap:android

# Open Xcode
pnpm cap:ios
```

**From apps/mobile-shell:**

```bash
# Build web + sync to Android
pnpm build:android

# Build web + sync to iOS
pnpm build:ios

# Sync only
pnpm sync

# Open IDEs
pnpm open:android
pnpm open:ios
```

### Using Remote Dev Server (Optional)

For faster iteration during development, you can point Capacitor to your dev server:

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Update `apps/mobile-shell/capacitor.config.ts`:**
   ```typescript
   server: {
     url: "http://YOUR_IP:3000", // Your machine's local IP
     cleartext: true,
   },
   ```

3. **Sync:**
   ```bash
   pnpm cap:sync
   ```

4. **Run app** - it will load from dev server instead of bundled assets

**Note:** For device testing, use ngrok or similar:
```bash
ngrok http 3000
# Use the ngrok URL in server.url
```

## Production Builds

### Web Production

```bash
pnpm build
```

Output: `apps/web/dist/` (ready for deployment to any static host)

### Android Production

1. **Build web app:**
   ```bash
   pnpm build
   ```

2. **Sync to Android:**
   ```bash
   pnpm cap:sync
   ```

3. **Open Android Studio:**
   ```bash
   pnpm cap:android
   ```

4. **In Android Studio:**
   - Build → Generate Signed Bundle / APK
   - Follow signing wizard
   - Output: `.aab` (for Play Store) or `.apk` (for direct install)

### iOS Production

1. **Build web app:**
   ```bash
   pnpm build
   ```

2. **Sync to iOS:**
   ```bash
   pnpm cap:sync
   ```

3. **Open Xcode:**
   ```bash
   pnpm cap:ios
   ```

4. **In Xcode:**
   - Product → Archive
   - Follow App Store Connect workflow
   - Output: `.ipa` file

## Important Notes

### Build Output Matching

- **Vite config** (`apps/web/vite.config.ts`): `build.outDir: "dist"`
- **Capacitor config** (`apps/mobile-shell/capacitor.config.ts`): `webDir: "../../apps/web/dist"`

These **MUST match**. If you change one, change the other.

### Service Worker

- Service worker is **disabled in dev mode** (HMR compatibility)
- Service worker is **enabled in production builds**
- Capacitor apps will use the service worker for offline functionality

### Platform Detection

Use `src/lib/platform.ts` utilities to detect environment:
- `isNative()` - Running in Capacitor native app
- `isStandalone()` - Running as installed PWA
- `getPlatform()` - Returns "native" | "standalone" | "web"

## Troubleshooting

### Web assets not updating in native app?

- Always run `pnpm cap:sync` after building
- Check that `apps/web/dist` exists and has content
- Clear native build caches:
  - Android: `cd apps/mobile-shell/android && ./gradlew clean`
  - iOS: Clean build folder in Xcode (Cmd+Shift+K)

### Build errors?

- Ensure Node.js >= 18
- Run `pnpm install` in root
- Check Capacitor version compatibility
- Review native project logs in Android Studio/Xcode

### App shows blank screen?

- Verify `webDir` path is correct in `capacitor.config.ts`
- Check that web app builds successfully
- Look at native console logs for errors
- Verify service worker isn't interfering

## Next Steps

- ✅ Web development workflow
- ✅ Capacitor setup
- ✅ Native app configuration
- ⏳ Real app icons and splash screens (see `public/icons/ICONS_README.md`)
- ⏳ App signing for stores
- ⏳ Store metadata preparation (see `QA_CHECKLIST.md`)

## QA Checklist

Before releasing, run through the **QA Checklist** in `QA_CHECKLIST.md`:

- Web functionality and PWA installability
- Android app testing
- iOS app testing
- Store readiness verification

The checklist covers:
- Route navigation
- Offline behavior
- UI layout and safe areas
- Performance
- Store requirements (icons, metadata, etc.)

