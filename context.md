# Perfect UI (`perfect-ui`) - Project Context & Architecture

> **Purpose for AI Agents & Contributors:**  
> This document provides an immediate, high-density architectural overview of the **Perfect UI** project, its mission, structure, conventions, and workflows. Read this before planning or implementing components.

---

## 1. Vision & Core Objectives

The shadcn ecosystem has two primary benchmark registries widely regarded as the gold standard:
1. **coss.com/ui** (Cal.com design system): Built on modern headless primitives (`@base-ui/react`), polymorphic `render` props, built-in loading indicators, refined micro-interactions, and enterprise ergonomics.
2. **Official shadcn/ui**: The pioneer design system built on Radix UI, Tailwind CSS, `class-variance-authority` (cva), and broad ecosystem adoption.

### Foundation Strategy: Coss as Primary, Shadcn as Complement
- **Primary Foundation (Coss UI)**: All core component architectures use **Coss UI** as the initial baseline. We adopt its modern headless primitives (`@base-ui/react`), flexible `render` props, loading states, and ergonomic API designs.
- **Complementary Fill-in (Official shadcn)**: Official shadcn is used to provide:
  - **Missing components and blocks** that Coss does not yet offer (e.g. `carousel`, `chart`, `drawer`, `input-otp`, `data-table`, `aspect-ratio`, etc.).
  - **Pragmatic class normalization**: Simplifying overcomplicated styling patterns (e.g. replacing fragile micro-calc pixel offsets with standard Tailwind utilities).

### First-Class Objective: Zero-Friction Ultracite & Biome Compliance
A major frustration with both upstream registries is that **neither conforms to modern Biome / Ultracite standards**:
- Official shadcn and coss frequently trigger linter warnings (unsorted Tailwind classes, namespace imports `import * as React`, missing `import type`, non-block statements, etc.).
- Developers installing components from those registries are forced to manually fix lint errors on every new file.

**Perfect UI solves this once and for all**:
- Every component, utility, and hook in `perfect-ui` strictly complies with `ultracite` (Biome) presets (`ultracite/biome/core` and `ultracite/biome/react`).
- Components install into consumer codebases cleanly, passing all Biome checks with zero warnings or friction.

---

## 2. Architecture & Directory Layout

```
perfect-ui/
├── registry/                      # Source code of Perfect UI items
│   └── ui/                        # Components (e.g. button.tsx)
│   └── lib/                       # Registry utilities (e.g. utils.ts)
│   └── hooks/                     # Custom registry hooks
├── references/                    # UPSTREAM REFERENCE MIRRORS (DO NOT COMMIT)
│   ├── shadcn/                    # Full mirror of official shadcn components
│   │   ├── ui/                    # 63 official UI components
│   │   ├── lib/                   # Official utils
│   │   └── registry.json          # Upstream shadcn catalog
│   └── coss/                      # Full mirror of coss.com/ui components
│       ├── ui/                    # 54 coss UI components
│       ├── lib/                   # Coss utilities and providers
│       ├── hooks/                 # Coss hooks
│       └── registry.json          # Upstream coss catalog
├── public/                        # Distribution artifacts (built files)
│   └── r/                         # Generated registry endpoints
│       ├── registry.json          # Compiled registry index
│       └── [component].json       # Standalone component payloads
├── scripts/
│   └── sync-references.js         # Fast concurrent script to sync references
├── registry.json                  # Root registry definition & item catalog
├── biome.jsonc                    # Ultracite / Biome linter & formatter config
├── tsconfig.json                  # Strict TypeScript configuration
├── package.json                   # Scripts, dependencies, and metadata
└── .gitignore                     # Excludes references/, public/r/, node_modules/
```

---

## 3. Reference System (`references/`)

The [`references/`](file:///d:/projects/typescript/perfect-ui/references) directory holds unadulterated copies of components from both upstream registries:
- **`references/shadcn/ui/`**: 63 official components from shadcn.
- **`references/coss/ui/`**: 54 components from coss.com/ui.

### Isolation Rules
1. **Git Excluded**: Ignored in [`.gitignore`](file:///d:/projects/typescript/perfect-ui/.gitignore). It is never committed to GitHub.
2. **Linter Excluded**: Excluded in [`biome.jsonc`](file:///d:/projects/typescript/perfect-ui/biome.jsonc) with `"includes": ["!references"]`. Upstream files remain bit-for-bit identical to source and are never reformatted.
3. **TypeScript Excluded**: Excluded in [`tsconfig.json`](file:///d:/projects/typescript/perfect-ui/tsconfig.json) with `"exclude": ["...", "references"]` to prevent foreign missing types from breaking the project build.
4. **Auto-Sync Command**:
   ```bash
   pnpm sync:references
   ```
   Fetches and refreshes all upstream components concurrently in ~8 seconds.

---

## 4. Toolchain & Quality Standards

- **Package Manager**: `pnpm` (v11+)
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript (`ESNext`, `bundler` module resolution, strict mode)
- **Code Quality**: `ultracite` (powered by Biome) extending `ultracite/biome/core` and `ultracite/biome/react`
- **Registry Engine**: `shadcn` CLI (v4+)

### Essential Scripts

| Command | Purpose |
|---|---|
| `pnpm lint` | Runs `ultracite check` (Biome lint & format validation) |
| `pnpm fix` | Runs `ultracite fix` (Biome auto-fix and format) |
| `pnpm typecheck` | Runs `tsc --noEmit` (TypeScript strict type verification) |
| `pnpm shadcn registry validate` | Validates [`registry.json`](file:///d:/projects/typescript/perfect-ui/registry.json) against shadcn schema |
| `pnpm build:registry` | Compiles source components into `./public/r/` JSON payloads |
| `pnpm sync:references` | Refreshes upstream `references/shadcn` and `references/coss` |

---

## 5. Consumer Installation & Distribution

This registry is published directly via GitHub:
**Repository**: `https://github.com/Kareem987/perfect-ui`

Any user or project running `shadcn` can install components immediately:
```bash
# Direct install
npx shadcn@latest add Kareem987/perfect-ui/<component>

# Preview / Dry run
npx shadcn@latest view Kareem987/perfect-ui/<component>
npx shadcn@latest add Kareem987/perfect-ui/<component> --dry-run
```

---

## 6. Component Creation Workflow (For AI Agents)

When creating or upgrading a component in `perfect-ui`:

### Step 1: Benchmark Upstream
Inspect both upstream sources side-by-side in `references/`:
- `references/shadcn/ui/<component>.tsx`
- `references/coss/ui/<component>.tsx`
Identify:
- Which headless primitive is superior (Radix UI vs Base UI vs native)?
- What prop APIs, accessibility attributes (ARIA), and micro-animations does each offer?
- What are the common rough edges, missing states, or styling inconsistencies?

### Step 2: Implement Perfected Component
Write the new component under [`registry/ui/<component>.tsx`](file:///d:/projects/typescript/perfect-ui/registry/ui) (or `registry/lib/`, `registry/hooks/`):
- **Base Architecture**: Start from Coss's Base UI architecture, polymorphic `render` prop (`useRender`), and loading states.
- **Strict Lint Compliance**: Use named type imports (`import type { ... } from "react"`), avoid namespace imports (`import * as React`), and ensure sorted Tailwind classes.
- **Styling Pragmatism (Avoiding Overcomplication)**:
  - *Coss's 1px Border Offset (`px-[calc(--spacing(3)-1px)]`)*: Coss subtracts 1px from horizontal padding to geometrically offset the 1px border inside border-box sizing. While designed for subpixel alignment to the 4px grid in Cal.com, it introduces noisy syntax, compiler friction, and poor overrides.
  - *Perfect UI Rule*: Prefer clean, standard Tailwind utilities (e.g. `px-3`, `px-4`, `h-9`) for universal compatibility, predictable `twMerge` behavior, and maintainable developer experience. Reserve `calc()` only where strictly necessary (such as concentric inner radius: `before:rounded-[calc(var(--radius)-1px)]`).
- **Zero Drift**: Keep components clean, self-contained, and free of unnecessary runtime dependencies.

### Step 3: Register in `registry.json`
Add the component metadata to [`registry.json`](file:///d:/projects/typescript/perfect-ui/registry.json):
```json
{
  "name": "<component-name>",
  "type": "registry:ui",
  "title": "<Human Readable Title>",
  "description": "<Concise description of the component.>",
  "dependencies": ["<any-npm-deps-needed>"],
  "registryDependencies": ["<any-internal-or-shadcn-deps>"],
  "files": [
    {
      "path": "registry/ui/<component-name>.tsx",
      "type": "registry:ui"
    }
  ]
}
```

### Step 4: Verification Pipeline
Always run the complete verification suite before completing work:
```bash
pnpm lint                       # Linting & formatting
pnpm typecheck                  # Type-checking
pnpm shadcn registry validate   # Schema validation
pnpm build:registry             # Build static JSON endpoints
```
Ensure all 4 commands exit cleanly with code 0.
