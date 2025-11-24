# App Icons Required

## PWA Icons (for manifest.webmanifest)

Create the following icons in `public/icons/`:

1. **icon-192.png** - 192x192 pixels
   - Used for Android home screen, PWA install
   - Square icon with app logo
   
2. **icon-512.png** - 512x512 pixels
   - Used for Android splash screen, high-res displays
   - Square icon with app logo
   - Also used as maskable icon

3. **apple-touch-icon.png** - 180x180 pixels (recommended)
   - Used for iOS home screen
   - Square icon with app logo

4. **mask-icon.svg** - SVG format
   - Used for Safari pinned tab icon
   - Monochrome SVG, single color

5. **favicon.ico** - 32x32 or 16x16 pixels
   - Traditional browser favicon
   - Can be multi-size ICO file

## Icon Design Guidelines

- Use FlatFlow brand colors (primary: #0ea5e9)
- Keep designs simple and recognizable at small sizes
- Ensure icons work on both light and dark backgrounds
- For maskable icons, ensure important content is within the safe zone (80% of the icon)

## Icon Generation Tools

- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://maskable.app/
- https://www.favicon-generator.org/

## Place Icons

Once created, place icons in `public/icons/`:
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/apple-touch-icon.png`
- `public/icons/mask-icon.svg`
- `public/icons/favicon.ico`

Then update references in:
- `vite.config.ts` (PWA manifest)
- `index.html` (apple-touch-icon, mask-icon, favicon)

## Android Native Icons

After running `npx cap add android`, update icons in:
- `apps/mobile-shell/android/app/src/main/res/mipmap-*/ic_launcher.png`
- `apps/mobile-shell/android/app/src/main/res/mipmap-*/ic_launcher_round.png`

Replace with your app icons in multiple resolutions:
- mipmap-mdpi: 48x48
- mipmap-hdpi: 72x72
- mipmap-xhdpi: 96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192

## iOS Native Icons

In Xcode (after `npx cap add ios`):
1. Open `apps/mobile-shell/ios/App/App.xcworkspace`
2. Select `App` target → `General` tab
3. Under `App Icons and Launch Screen`, drag icons to `AppIcon` asset catalog
4. Required sizes: 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt

---

**TODO:** Replace placeholder assets with real app icons before store submission.

