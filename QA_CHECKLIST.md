# QA Checklist

This checklist helps ensure the app works correctly across all platforms before release.

## Web QA

### Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

### Checklist

- [ ] All routes load correctly:
  - [ ] `/` (Dashboard)
  - [ ] `/members` (Members)
  - [ ] `/bills` (Bills)
  - [ ] `/expenses` (Expenses)
  - [ ] `/settings` (Settings)

- [ ] Layout works on:
  - [ ] Desktop viewport (1920x1080, etc.)
  - [ ] Tablet viewport (768x1024)
  - [ ] Mobile viewport (360x640, 414x896)

- [ ] PWA Installability:
  - [ ] Open in Chrome → Click "Install" or see install prompt
  - [ ] Manifest shows correct name, icons, theme color
  - [ ] Service worker registers in production build
  - [ ] Lighthouse PWA audit passes (score 100+)

- [ ] Offline Navigation:
  - [ ] Load app in browser
  - [ ] Go offline (DevTools → Network → Offline)
  - [ ] Navigate between routes (Dashboard → Members → Bills, etc.)
  - [ ] All routes load offline after initial load

- [ ] Offline Indicator:
  - [ ] Shows "Offline" banner when network disconnected
  - [ ] Shows "Back online – syncing" toast when reconnected

- [ ] Theme Switching:
  - [ ] Dark mode toggle works in Settings
  - [ ] Theme persists across page refreshes

- [ ] Bottom Navigation (Mobile):
  - [ ] Appears on mobile viewport
  - [ ] Hidden on desktop
  - [ ] Active route highlighted

## Android QA

### Commands

```bash
# Build and sync
pnpm build
cd apps/mobile-shell
npx cap sync

# Open in Android Studio
npx cap open android
```

### Checklist

- [ ] App Installation:
  - [ ] App installs successfully on emulator/device
  - [ ] App icon appears correctly on launcher
  - [ ] App name shows as "FlatFlow" (not default template name)

- [ ] App Launch:
  - [ ] App launches without crashes
  - [ ] Splash screen displays correctly (theme color #0ea5e9)
  - [ ] No white screen flash on startup

- [ ] UI Layout:
  - [ ] Status bar color matches theme (#0ea5e9)
  - [ ] No content hidden under status bar
  - [ ] No weird double status bar
  - [ ] Bottom navigation accessible (not cut off)
  - [ ] Content doesn't get clipped by system UI

- [ ] Navigation:
  - [ ] All routes work (Dashboard, Members, Bills, Expenses, Settings)
  - [ ] Back button behavior:
    - [ ] From root screen (Dashboard): Closes app
    - [ ] From nested routes: Navigates back
  - [ ] Bottom navigation highlights active route

- [ ] Offline Behavior:
  - [ ] After first launch, turn off network
  - [ ] Navigate between routes
  - [ ] All routes load offline
  - [ ] Offline indicator shows

- [ ] Keyboard:
  - [ ] Keyboard doesn't cover input fields
  - [ ] Viewport resizes correctly when keyboard appears
  - [ ] Dismissing keyboard restores layout

- [ ] Performance:
  - [ ] Smooth scrolling
  - [ ] No jank or lag
  - [ ] Fast initial load

## iOS QA

### Commands

```bash
# Build and sync
pnpm build
cd apps/mobile-shell
npx cap sync

# Open in Xcode
npx cap open ios
```

### Checklist

- [ ] App Installation:
  - [ ] App installs on simulator/device
  - [ ] App icon appears correctly on home screen
  - [ ] App name shows as "FlatFlow"

- [ ] App Launch:
  - [ ] App launches without crashes
  - [ ] Launch screen displays correctly
  - [ ] No white screen flash

- [ ] Safe Area Handling:
  - [ ] Content doesn't get cut off by notch (iPhone X+)
  - [ ] Content doesn't get cut off by home indicator (iPhone X+)
  - [ ] Top padding respects safe area
  - [ ] Bottom padding respects safe area (for bottom nav)

- [ ] Status Bar:
  - [ ] Status bar style is readable (light/dark based on background)
  - [ ] Status bar color matches theme
  - [ ] Status bar doesn't interfere with app content

- [ ] Navigation:
  - [ ] All routes work
  - [ ] Bottom navigation works correctly
  - [ ] Swipe gestures work (back swipe)

- [ ] Offline Behavior:
  - [ ] After first launch, enable airplane mode
  - [ ] Navigate between routes
  - [ ] All routes load offline
  - [ ] Offline indicator shows

- [ ] Keyboard:
  - [ ] Keyboard doesn't cover input fields
  - [ ] Viewport adjusts when keyboard appears
  - [ ] Safe area respected even with keyboard

- [ ] Orientation:
  - [ ] App locked to portrait mode
  - [ ] Layout works correctly in portrait

## Store Readiness

### Still Need to Provide Manually

#### Icons & Assets:
- [ ] Real app icons (replace placeholders):
  - [ ] PWA icons (192x192, 512x512)
  - [ ] iOS app icons (all sizes for AppIcon asset catalog)
  - [ ] Android app icons (all mipmap densities)

- [ ] Splash Screens:
  - [ ] Android splash screen assets
  - [ ] iOS launch screen customization

#### Store Metadata:
- [ ] Privacy Policy URL
- [ ] Short description (80-120 characters)
- [ ] Full description (4000 characters max)
- [ ] App screenshots:
  - [ ] Phone screenshots (required)
  - [ ] Tablet screenshots (optional but recommended)
  - [ ] Various device sizes (iPhone, Android phones)

#### Technical:
- [ ] App signing configured (Android: keystore, iOS: certificates)
- [ ] Version code/number incremented for release
- [ ] App Store Connect / Play Console accounts set up
- [ ] TestFlight / Internal testing completed

#### Legal/Compliance:
- [ ] Privacy Policy page created and linked
- [ ] Terms of Service (if applicable)
- [ ] Data collection disclosure
- [ ] Age rating information

## Quick Smoke Test

Run this minimal checklist before every release:

- [ ] App builds without errors (`pnpm build`)
- [ ] Web preview works (`pnpm preview`)
- [ ] Android app installs and launches
- [ ] iOS app installs and launches (simulator)
- [ ] All 5 main routes work
- [ ] Offline navigation works
- [ ] No console errors in production build

## Notes

- Test on real devices, not just emulators
- Test on multiple Android versions (API 22+)
- Test on multiple iOS versions (iOS 13+)
- Check both light and dark themes
- Test with slow network connections
- Test with airplane mode (offline)

---

**Last Updated:** Phase 4 Implementation








