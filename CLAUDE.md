# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VitePress-based static documentation site for rendering notes. Monorepo structure separating blog code from content.

## Commands

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Sync content + build static site
npm run preview  # Preview production build locally
npm run sync     # Regenerate sidebar from posts directory
```

## Project Structure

```
packages/
├── core/                         # VitePress blog engine
│   ├── .vitepress/
│   │   ├── config.mts            # Site config (nav, sidebar, theme)
│   │   └── theme/
│   │       ├── index.js          # Custom theme setup
│   │       └── components/       # Vue components for markdown
│   └── scripts/
│       └── sync-content.js       # Auto-generates sidebar from posts
└── content/                      # Markdown content and assets
    ├── index.md                  # Homepage
    ├── posts/                    # Blog posts
    └── images/                   # Image assets
```

## Architecture Notes

- **Monorepo with npm workspaces**: `@blog/core` (VitePress) and `@blog/content` (markdown/images)
- **srcDir**: Core's VitePress config points to `../content` as source directory
- **Content sync**: `npm run sync` scans posts and updates sidebar config automatically
- Static site only, no SSR

## Adding Content

1. Add markdown files to `packages/content/posts/`
2. Add images to `packages/content/images/`
3. Run `npm run sync` to update sidebar
4. Optionally use frontmatter `order: N` to control sort order

## Custom Components

Use in markdown:
```md
<ImageCompare before="/images/a.png" after="/images/b.png" />
```
