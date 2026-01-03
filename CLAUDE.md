# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VitePress-based static documentation site for rendering notes. Monorepo structure separating blog code from content.

## Commands

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build static site for production
npm run preview  # Preview production build locally
npm install      # Install dependencies (uses workspaces)
```

## Project Structure

```
packages/
├── core/                    # VitePress blog engine
│   ├── .vitepress/
│   │   └── config.mts       # Site config (nav, sidebar, theme)
│   └── package.json
└── content/                 # Markdown content and assets
    ├── index.md             # Homepage
    ├── posts/               # Blog posts
    └── images/              # Image assets
```

## Architecture Notes

- **Monorepo with npm workspaces**: `@blog/core` (VitePress) and `@blog/content` (markdown/images)
- **srcDir**: Core's VitePress config points to `../content` as source directory
- Static site only, no SSR
