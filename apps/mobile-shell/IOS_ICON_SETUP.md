# iOS AppIcon Configuration Guide

After adding the iOS platform, you need to configure the app icon in Xcode.

## Prerequisites

- macOS with Xcode installed
- iOS platform added: `npx cap add ios`
- PWA icons generated: `pnpm --filter web generate-icons`

## Steps to Configure iOS AppIcon

1. **Open the iOS project in Xcode:**
   ```bash
   cd apps/mobile-shell
   npx cap open ios
   ```
   Or manually open:
   ```
   apps/mobile-shell/ios/App/App.xcworkspace
   ```

2. **Navigate to AppIcon:**
   - In Xcode, select the `App` project in the navigator (top left)
   - Select the `App` target
   - Go to the "General" tab
   - Scroll down to "App Icons and Launch Screen"
   - Click on the AppIcon set in the "App Icons Source" section

3. **Configure AppIcon Sizes:**
   
   The AppIcon asset catalog requires the following sizes (all square):
   - **20x20 pt** (@2x: 40x40px, @3x: 60x60px) - Notification icons
   - **29x29 pt** (@2x: 58x58px, @3x: 87x87px) - Settings icon
   - **40x40 pt** (@2x: 80x80px, @3x: 120x120px) - Spotlight icon
   - **60x60 pt** (@2x: 120x120px, @3x: 180x180px) - App icon
   - **1024x1024 pt** (1024x1024px) - App Store icon

4. **Use PWA Icons as Source:**
   
   You can use the generated PWA icons from `apps/web/public/`:
   - `pwa-512x512.png` - Use as base for all sizes
   - `apple-touch-icon.png` (180x180) - Already sized for iOS
   
   **Recommended approach:**
   - Use `pwa-512x512.png` and resize for each required size
   - Or use `apple-touch-icon.png` and upscale to 1024x1024 for App Store
   - Or regenerate icons using the icon generation script with specific sizes

5. **Drag and Drop Icons:**
   - Drag each icon image into its corresponding slot in the AppIcon asset catalog
   - Xcode will validate that the sizes match
   - Ensure all required sizes are filled

6. **Verify:**
   - Build and run the app in the iOS simulator
   - Check that the app icon appears correctly on the home screen
   - Test on a physical device if possible

## Icon Generation Script

You can generate iOS-specific icon sizes using the icon generation script:

```bash
cd apps/web
pnpm generate-icons
```

Then manually resize for iOS requirements or create a script to generate iOS-specific sizes.

## Alternative: Using Icon Generator Tools

For production apps, consider using professional icon generation tools:

- **MakeAppIcon**: https://makeappicon.com/
- **AppIcon.co**: https://appicon.co/
- **IconKitchen**: https://icon.kitchen/
- **Icon Generator**: Various online tools

These tools can take your source icon (512x512 or 1024x1024) and generate all required sizes automatically.

## Notes

- All iOS app icons must be square (no transparency for app icon, transparency allowed for some sizes)
- The App Store icon (1024x1024) must be PNG or JPEG without transparency
- Icons should follow Apple's Human Interface Guidelines
- Test icons on both light and dark backgrounds
- The app icon appears in multiple places: home screen, settings, notifications, etc.

## Current Status

✅ iOS platform added
⏳ AppIcon configuration pending (requires Xcode)

After configuring the AppIcon, your iOS app will display the custom icon instead of the default Capacitor icon.

