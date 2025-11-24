# Environment Variables Example

This file documents the environment variables available for the FlatFlow app.

For a comprehensive example with all available options, see `.env.example` in the same directory.

## Quick Start

1. **Copy the example file:**
   ```bash
   cd apps/web
   cp .env.example .env.local        # For development
   cp .env.example .env.production   # For production (edit content)
   ```

2. **Or create manually:**
   Create `.env.local` or `.env.production` with your variables

## Common Variables

### Development Environment (`.env.local`)

```env
# App Version (optional)
VITE_APP_VERSION=0.1.0-dev

# API Base URL
VITE_API_BASE_URL=http://localhost:4000

# Debug mode
VITE_DEBUG=true
```

### Production Environment (`.env.production`)

```env
# App Version
VITE_APP_VERSION=1.0.0

# Production API Base URL
VITE_API_BASE_URL=https://api.flatflow.app

# Disable debug
VITE_DEBUG=false
```

## Usage in Code

Access environment variables using `import.meta.env`:

```typescript
// Direct access
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appVersion = import.meta.env.VITE_APP_VERSION;

// Or use config helpers
import { API_BASE_URL, ENV } from '@/config/env';
import { APP_VERSION, getAppVersionString } from '@/config/appInfo';
```

## Build-Time Injection

Inject variables at build time:

```bash
# Single variable
VITE_APP_VERSION=1.0.0 pnpm build

# Multiple variables
VITE_APP_VERSION=1.0.0 VITE_API_BASE_URL=https://api.example.com pnpm build
```

## Important Notes

- **All variables must be prefixed with `VITE_`** to be accessible in the app
- Variables are **injected at build time**, not runtime
- `.env.local` files are **gitignored** (see `.gitignore`)
- **Never commit** `.env` files with sensitive data (API keys, secrets)
- See `.env.example` for a complete list of available variables

## Available Variables

See `.env.example` for the complete list of environment variables including:
- App configuration (version)
- API configuration (base URL, timeout)
- Feature flags (analytics, error reporting)
- Development settings (debug mode, mock API)

