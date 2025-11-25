# Project Structure

```
FlatFlow/
├── 📁 apps/
│   ├── 📁 web/                    # Main React Web App (PWA)
│   │   ├── 📁 public/            # Static assets
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/    # App-specific components
│   │   │   │   └── 📁 layout/    # Layout components (Navbar, BottomNav)
│   │   │   ├── 📁 pages/         # Route pages (Dashboard, Members, Bills, etc.)
│   │   │   ├── 📁 config/        # App config (routes, etc.)
│   │   │   └── 📁 styles/        # Global styles
│   │   ├── package.json
│   │   ├── vite.config.ts        # Vite configuration
│   │   ├── tailwind.config.js    # Tailwind + DaisyUI config
│   │   └── tsconfig.json
│   │
│   └── 📁 mobile-shell/          # Capacitor Project (Phase 3)
│       ├── package.json
│       └── capacitor.config.ts   # Capacitor configuration
│
├── 📁 packages/
│   ├── 📁 config/                # Shared Configuration
│   │   ├── 📁 tsconfig/          # TypeScript presets
│   │   ├── 📁 eslint/            # ESLint presets
│   │   └── 📁 tailwind/          # Tailwind theme presets
│   │
│   ├── 📁 ui/                    # Shared UI Components
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/    # Button, Card, Input, etc.
│   │   │   └── index.ts          # Public exports
│   │   ├── package.json
│   │   └── tsup.config.ts        # Build configuration
│   │
│   └── 📁 core/                  # Business Logic & Types
│       ├── 📁 src/
│       │   ├── 📁 types/         # Domain models (Member, Bill, Expense)
│       │   ├── 📁 utils/         # Utility functions
│       │   └── index.ts          # Public exports
│       ├── package.json
│       └── tsup.config.ts        # Build configuration
│
├── 📄 package.json               # Root workspace config
├── 📄 pnpm-workspace.yaml        # pnpm workspace definition
├── 📄 .gitignore
├── 📄 .editorconfig
├── 📄 README.md                  # Main documentation
├── 📄 SETUP.md                   # Setup instructions
└── 📄 STRUCTURE.md               # This file
```

## Key Files

### Root Level
- `package.json` - Root package with workspace scripts
- `pnpm-workspace.yaml` - Defines workspace packages
- `.gitignore` - Git ignore rules
- `.editorconfig` - Editor consistency
- `README.md` - Project documentation
- `SETUP.md` - Setup guide

### Web App (`apps/web/`)
- `src/main.tsx` - App entry point
- `src/App.tsx` - Root component with routing
- `src/config/routes.tsx` - Route definitions
- `vite.config.ts` - Vite + PWA configuration
- `tailwind.config.js` - Tailwind + DaisyUI setup

### Packages

**@flatflow/config**
- Shared TypeScript, ESLint, and Tailwind configurations
- Reusable across all packages/apps

**@flatflow/ui**
- Reusable UI components
- Uses Tailwind + DaisyUI
- Exported as ESM and CJS

**@flatflow/core**
- Domain types and models
- Utility functions
- Business logic (to be expanded)

## Workspace Protocol

All internal dependencies use `workspace:*` protocol:

```json
{
  "dependencies": {
    "@flatflow/ui": "workspace:*",
    "@flatflow/core": "workspace:*"
  }
}
```

This ensures pnpm links local packages instead of installing from npm.




