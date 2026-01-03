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
    └── posts/
        └── my-post/              # Each post is a folder
            ├── index.md          # Post content
            └── image.png         # Co-located images
```

## Architecture Notes

- **Monorepo with npm workspaces**: `@blog/core` (VitePress) and `@blog/content` (markdown/images)
- **srcDir**: Core's VitePress config points to `../content` as source directory
- **Content sync**: `npm run sync` scans posts and updates sidebar config automatically
- **Co-located images**: Each post folder contains its own images
- Static site only, no SSR

## Adding Content

1. Create folder in `packages/content/posts/my-post/`
2. Add `index.md` and images in same folder
3. Reference images with relative paths: `./image.png`
4. Run `npm run sync` to update sidebar
5. Optionally use frontmatter `order: N` to control sort order

## Custom Components

Use in markdown:
```md
<ImageCompare before="./noisy.png" after="./denoised.png" />
```
