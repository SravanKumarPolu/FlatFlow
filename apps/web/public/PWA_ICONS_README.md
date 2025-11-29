# PWA Icons Required

The PWA manifest references the following icons that need to be created:

## Required Icons

1. **pwa-192x192.png** - 192x192 pixels
   - Used for Android home screen and app launcher
   - Should be a square icon with your app logo

2. **pwa-512x512.png** - 512x512 pixels
   - Used for Android splash screen and high-res displays
   - Should be a square icon with your app logo
   - Also used as maskable icon

3. **apple-touch-icon.png** - 180x180 pixels (recommended)
   - Used for iOS home screen
   - Should be a square icon with your app logo

4. **mask-icon.svg** - SVG format
   - Used for Safari pinned tab icon
   - Should be a monochrome SVG

5. **favicon.ico** - 32x32 or 16x16 pixels
   - Traditional browser favicon

## Icon Design Guidelines

- Use the FlatFlow brand colors (primary: #0ea5e9)
- Keep designs simple and recognizable at small sizes
- Ensure icons work well on both light and dark backgrounds
- For maskable icons, ensure important content is within the safe zone (80% of the icon)

## Quick Generation

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://maskable.app/

Or create them manually using design tools like Figma, Sketch, or Adobe Illustrator.

## Place Icons

Place all icons in the `public/` directory:
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/apple-touch-icon.png`
- `public/mask-icon.svg`
- `public/favicon.ico`

The vite-plugin-pwa will automatically include these in the build.






