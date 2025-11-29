# FlatFlow

**FlatFlow** - A cross-platform app for managing shared expenses and bills (Web + Android + iOS)

Built with React, TypeScript, Tailwind CSS, DaisyUI, and Capacitor.

## 🏗️ Architecture

This is a **monorepo** structure designed to be reusable across multiple apps (FlatFlow, BillLens, Boostlly, etc.).

```
flatflow/
├── apps/
│   ├── web/              # React + Vite + TS + Tailwind + DaisyUI (PWA)
│   └── mobile-shell/     # Capacitor project (Android + iOS)
├── packages/
│   ├── config/           # Shared ESLint, TS, Tailwind configs
│   ├── ui/               # Shared UI components (Button, Card, Input, etc.)
│   └── core/             # Business logic, types, utilities
└── package.json          # Root workspace config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 ([Install pnpm](https://pnpm.io/installation))

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# The app will open at http://localhost:3000
```

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Packages

### `apps/web`

The main React web application (also serves as PWA and mobile app source).

**Tech Stack:**
- ⚡ Vite - Fast build tool and dev server
- ⚛️ React 18 - UI library
- 📘 TypeScript - Type safety
- 🎨 Tailwind CSS - Utility-first CSS
- 🌸 DaisyUI - Component library
- 🧭 React Router - Client-side routing
- 🔄 Vite PWA Plugin - Service worker & manifest

### `packages/ui`

Reusable UI components built with Tailwind + DaisyUI.

**Components:**
- `Button` - Customizable button with variants
- `Card` - Container component
- `Input` - Form input with label/error support
- More to come...

### `packages/core`

Core business logic, types, and utilities.

**Contents:**
- Type definitions (Member, Bill, Expense)
- Utility functions (formatCurrency, formatDate)
- Hooks and data layer (to be added)

### `packages/config`

Shared configuration files for:
- TypeScript (`tsconfig` presets)
- ESLint (base + React presets)
- Tailwind (theme presets)

### `apps/mobile-shell`

Capacitor project for wrapping the web app as native Android/iOS apps.

**Setup:** See [Phase 3 Roadmap](#-roadmap) below.

## 🗺️ Roadmap

### ✅ Phase 1 – Web SPA (Current)

- [x] Monorepo setup with pnpm workspace
- [x] Web app with Vite + React + TypeScript
- [x] Tailwind CSS + DaisyUI integration
- [x] Basic routing structure
- [x] Layout components (Navbar, BottomNav)
- [x] Placeholder pages (Dashboard, Members, Bills, Expenses, Settings)
- [x] Shared UI components package
- [x] Shared core package with types

**Next Steps:**
- Implement data layer (local storage / IndexedDB)
- Add API integration (Supabase or custom backend)
- Build out page functionality
- Add forms and interactions

### 🔜 Phase 2 – PWA Polish

- [ ] Add web app manifest (`manifest.json`)
- [ ] Configure service worker (already set up via Vite PWA plugin)
- [ ] Create app icons (192x192, 512x512)
- [ ] Implement "Add to Home Screen" banner/UX
- [ ] Test on mobile browsers (iOS Safari, Android Chrome)
- [ ] Optimize for mobile viewports (360x640, 414x896)
- [ ] Test offline functionality

### 📱 Phase 3 – Android App (Capacitor)

- [ ] Install Capacitor CLI
- [ ] Initialize Capacitor in `apps/mobile-shell`
- [ ] Configure `capacitor.config.ts`
- [ ] Add Android platform: `npx cap add android`
- [ ] Test on Android emulator
- [ ] Test on physical Android device
- [ ] Fix viewport/keyboard/status bar issues
- [ ] Generate signed APK for Play Store

### 🍎 Phase 4 – iOS App (Capacitor)

- [ ] Add iOS platform: `npx cap add ios`
- [ ] Open in Xcode: `npx cap open ios`
- [ ] Configure app icons and launch screen
- [ ] Set up Bundle ID and signing
- [ ] Test on iOS simulator
- [ ] Test on physical iPhone
- [ ] Prepare for App Store (screenshots, description, privacy policy)
- [ ] Submit to TestFlight / App Store

## 🎨 Design System

### Theme

The app uses DaisyUI themes. Current themes:
- `light` (default)
- `dark`
- `flatflow` (custom brand theme)

Switch themes using `data-theme` attribute:
```html
<html data-theme="flatflow">
```

### Colors

Primary brand color: `#0ea5e9` (sky blue)

Customize in:
- `apps/web/tailwind.config.js` - DaisyUI theme config
- `packages/config/tailwind/preset.js` - Shared theme presets

### Components

All UI components use DaisyUI classes for consistency:
- Buttons: `btn`, `btn-primary`, `btn-secondary`
- Cards: `card`, `card-body`
- Forms: `input`, `input-bordered`, `form-control`
- Navigation: `navbar`, `btm-nav`

## 📱 PWA Features

The web app is configured as a Progressive Web App (PWA):

- **Service Worker**: Automatic caching of static assets
- **Web Manifest**: App metadata, icons, theme colors
- **Offline Support**: Basic offline functionality via service worker
- **Installable**: Users can "Add to Home Screen" on mobile

## 🔧 Development

### Scripts

From root:

```bash
pnpm dev          # Start web app dev server
pnpm build        # Build web app
pnpm preview      # Preview production build
pnpm lint         # Lint all packages
pnpm type-check   # Type check all packages
pnpm clean        # Clean all build artifacts
```

From a specific package:

```bash
cd apps/web
pnpm dev

cd packages/ui
pnpm build
```

### Adding New Packages

1. Create directory in `packages/`
2. Add `package.json` with `workspace:*` dependencies
3. Run `pnpm install` from root
4. Import in your app: `import { Something } from "@flatflow/package-name"`

## 🧪 Testing

(To be added in future phases)

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## 📝 Code Style

- **TypeScript** with strict mode enabled
- **ESLint** with React + TypeScript rules
- **Prettier** (to be added) for code formatting
- **EditorConfig** for consistent editor settings

## 🔐 Environment Variables

Create `.env.local` in `apps/web/` for local development:

```env
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI Components](https://daisyui.com/components/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [React Router](https://reactrouter.com/)

## 🎯 Future Enhancements

- [ ] Offline-first data layer with IndexedDB
- [ ] Real-time sync with backend
- [ ] Push notifications (via Capacitor)
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Analytics integration
- [ ] Error tracking (Sentry)

## 📄 License

(To be determined)

---

**Built with ❤️ for managing shared expenses**

For questions or issues, please open an issue on the repository.






