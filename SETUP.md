# Setup Guide

This guide will help you get the FlatFlow monorepo up and running.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. **pnpm** (v8 or higher)
   ```bash
   npm install -g pnpm@8
   pnpm --version  # Should be >= 8.0.0
   ```

## Initial Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

   This will install all dependencies for the root workspace and all packages/apps.

2. **Start the development server**
   ```bash
   pnpm dev
   ```

   The web app will start at `http://localhost:3000` and should open automatically.

## Project Structure

```
flatflow/
├── apps/
│   ├── web/              # Main React web app (PWA)
│   └── mobile-shell/     # Capacitor wrapper (Phase 3)
├── packages/
│   ├── config/           # Shared configs (TS, ESLint, Tailwind)
│   ├── ui/               # Shared UI components
│   └── core/             # Business logic & types
└── package.json          # Root workspace config
```

## Development Workflow

### Running the Web App

```bash
# From root
pnpm dev

# Or from apps/web
cd apps/web
pnpm dev
```

### Building Packages

```bash
# Build UI package
cd packages/ui
pnpm build

# Build core package
cd packages/core
pnpm build
```

### Type Checking

```bash
# Check all packages
pnpm type-check

# Check specific package
cd apps/web
pnpm type-check
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
cd apps/web
pnpm lint
```

## Adding New Features

### Adding a New Page

1. Create a new component in `apps/web/src/pages/`
2. Add route to `apps/web/src/config/routes.tsx`
3. The route will automatically appear in the navigation

### Adding a New UI Component

1. Create component in `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Use in your app: `import { ComponentName } from "@flatflow/ui"`

### Adding Core Utilities

1. Add to `packages/core/src/`
2. Export from `packages/core/src/index.ts`
3. Use in your app: `import { utilityName } from "@flatflow/core"`

## Environment Variables

Create `apps/web/.env.local` for local development:

```env
# API Configuration
VITE_API_URL=http://localhost:4000

# Supabase (if using)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Troubleshooting

### pnpm not found

Install pnpm globally:
```bash
npm install -g pnpm@8
```

### Port 3000 already in use

The dev server will try to find the next available port, or you can specify:
```bash
cd apps/web
pnpm dev -- --port 3001
```

### Type errors after adding a package

Rebuild the workspace:
```bash
pnpm install
```

### Module not found errors

Ensure you've run `pnpm install` from the root, and that workspace dependencies use `workspace:*` protocol.

## Next Steps

Once you have the project running:

1. ✅ Explore the codebase structure
2. ✅ Check out the placeholder pages (Dashboard, Members, Bills, etc.)
3. ✅ Review the shared UI components in `packages/ui`
4. ✅ Look at the types defined in `packages/core`

Then proceed with **Phase 1** development:
- Implement data layer
- Connect to backend API
- Build out page functionality
- Add forms and interactions

## Getting Help

- Check the main [README.md](./README.md) for architecture details
- Review the roadmap in README for what's next
- Look at package-specific README files in each package directory






