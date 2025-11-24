# @flatflow/config

Shared configuration files for the FlatFlow monorepo.

## Contents

- **tsconfig/** - TypeScript configuration presets
- **eslint/** - ESLint configuration presets
- **tailwind/** - Tailwind CSS configuration presets

## Usage

Extend these configs in your apps/packages:

### TypeScript

```json
{
  "extends": "@flatflow/config/tsconfig/base.json"
}
```

### ESLint

```js
module.exports = {
  extends: ["@flatflow/config/eslint/react.js"],
};
```

### Tailwind

```js
module.exports = {
  presets: [require("@flatflow/config/tailwind/preset.js")],
  // ... your config
};
```

