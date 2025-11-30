# Platform Setup Instructions

This document provides step-by-step instructions for adding Android and iOS platforms to the Capacitor project.

## Prerequisites

Before adding platforms, ensure:

- ✅ Capacitor dependencies installed (`pnpm install` in root)
- ✅ Web app builds successfully (`pnpm build`)
- ✅ Android Studio installed (for Android)
- ✅ Xcode installed (for iOS, macOS only)

## Adding Platforms

### Step 1: Build Web App

```bash
# From project root
pnpm build
```

This creates `apps/web/dist/` with all web assets.

### Step 2: Add Android Platform

```bash
cd apps/mobile-shell
npx cap add android
```

**What this does:**
- Creates `apps/mobile-shell/android/` directory
- Sets up Android Gradle project
- Configures native Android app
- Copies web assets from `webDir` to Android project

**Important:**
- The `android/` folder is created at the same level as `capacitor.config.ts`
- This matches the monorepo structure (platforms live in `apps/mobile-shell/`)

### Step 3: Add iOS Platform

```bash
# Still in apps/mobile-shell
npx cap add ios
```

**What this does:**
- Creates `apps/mobile-shell/ios/` directory
- Sets up Xcode project
- Configures native iOS app
- Copies web assets from `webDir` to iOS project

**Important:**
- Requires macOS and Xcode
- The `ios/` folder is created at the same level as `capacitor.config.ts`

### Step 4: Verify Structure

After adding platforms, your structure should look like:

```
apps/mobile-shell/
├── capacitor.config.ts
├── package.json
├── android/          ✅ Created by `cap add android`
│   ├── app/
│   ├── gradle/
│   └── ...
└── ios/              ✅ Created by `cap add ios`
    ├── App/
    ├── App.xcodeproj
    └── ...
```

## Post-Platform Setup

### Android Configuration

After `android/` exists, verify/update:

1. **App ID (Package Name)**
   - Location: `android/app/build.gradle`
   - Field: `applicationId`
   - Should match: `appId` in `capacitor.config.ts` (`com.flatflow.app`)

2. **App Name**
   - Location: `android/app/src/main/res/values/strings.xml`
   - Field: `app_name`
   - Should match: `appName` in `capacitor.config.ts` (`FlatFlow`)

3. **Theme & Status Bar**
   - Location: `android/app/src/main/res/values/styles.xml` or `themes.xml`
   - Ensure light status bar style
   - Theme color should match PWA theme (#0ea5e9)

4. **Splash Screen**
   - Uses Capacitor SplashScreen plugin (configured in `capacitor.config.ts`)
   - Custom splash resources can be added to `android/app/src/main/res/`

5. **Hardware Acceleration**
   - Usually enabled by default
   - Check `android/app/src/main/AndroidManifest.xml` if needed

6. **Back Button Behavior**
   - Default: Capacitor closes app on back from root route
   - To customize: Use Capacitor App plugin `backButton` listener
   - Example (add to React app later if needed):
     ```typescript
     import { App } from '@capacitor/app';
     
     App.addListener('backButton', ({ canGoBack }) => {
       if (canGoBack) {
         window.history.back();
       } else {
         App.exitApp();
       }
     });
     ```

### iOS Configuration

After `ios/` exists, verify/update:

1. **Bundle ID**
   - Location: Xcode project settings → General → Bundle Identifier
   - Should match: `appId` in `capacitor.config.ts` (`com.flatflow.app`)
   - Also check: `ios/App/App/Info.plist` → `CFBundleIdentifier`

2. **App Name (Display Name)**
   - Location: Xcode project settings → General → Display Name
   - Should match: `appName` in `capacitor.config.ts` (`FlatFlow`)
   - Also in: `ios/App/App/Info.plist` → `CFBundleDisplayName`

3. **Status Bar Style**
   - Configured via Capacitor StatusBar plugin (in `capacitor.config.ts`)
   - Current: `style: "dark"`, `backgroundColor: "#0ea5e9"`
   - CSS safe area already handled in `apps/web/src/styles/index.css`

4. **Safe Area Support**
   - Already configured in CSS with `env(safe-area-inset-*)`
   - Ensure `viewport-fit=cover` in `apps/web/index.html` (already set)

5. **Orientation**
   - Set in `capacitor.config.ts`: `orientation: "portrait"`
   - Verify in Xcode: Deployment Info → Device Orientation

## Platform-Specific Notes

### Android

- **Min SDK:** Capacitor 5 requires Android API 22+ (Android 5.1)
- **Target SDK:** Should be latest (Android 13/API 33+ recommended)
- **Build Tools:** Gradle manages this automatically

### iOS

- **Minimum iOS:** Capacitor 5 requires iOS 13+
- **Deployment Target:** Check Xcode project settings
- **CocoaPods:** Dependencies managed automatically by Capacitor
- **Signing:** Configure in Xcode → Signing & Capabilities

## Testing Platforms

### Android

```bash
# Open in Android Studio
cd apps/mobile-shell
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync
# 2. Select device/emulator
# 3. Click Run ▶️
```

### iOS

```bash
# Open in Xcode
cd apps/mobile-shell
npx cap open ios

# In Xcode:
# 1. Select development team (Signing & Capabilities)
# 2. Select simulator or device
# 3. Click Run ▶️
```

## Troubleshooting Platform Setup

### Android

**Gradle sync fails:**
- Check Java/JDK version (requires JDK 11+)
- Check Android SDK path in Android Studio
- Try: `cd android && ./gradlew clean`

**Build fails:**
- Check `applicationId` matches `appId` in `capacitor.config.ts`
- Verify Android SDK installed
- Check build.gradle files for errors

### iOS

**Pod install fails:**
- Run: `cd ios/App && pod install`
- Check CocoaPods version: `pod --version`
- Try: `pod repo update`

**Signing errors:**
- Configure development team in Xcode
- Check Bundle ID matches `appId`
- Verify certificates in Keychain

**Build fails:**
- Check Xcode version (requires Xcode 14+)
- Verify iOS deployment target
- Check for missing dependencies

## Next Steps

After platforms are added:

1. ✅ Verify app builds in Android Studio/Xcode
2. ✅ Test on emulator/simulator
3. ✅ Test on physical devices
4. ✅ Configure app icons and splash screens
5. ✅ Set up app signing for production
6. ✅ Prepare for Play Store / App Store submission

---

**Status:** Platforms ready to add via `npx cap add android` and `npx cap add ios`








