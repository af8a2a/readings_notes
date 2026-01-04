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
    ├── public/                   # Static assets (copied as-is)
    │   └── images/               # Images for Vue components
    └── posts/
        └── my-post/              # Each post is a folder
            ├── index.md          # Post content
            └── image.png         # Co-located images (markdown only)
```

## Architecture Notes

- **Monorepo with npm workspaces**: `@blog/core` (VitePress) and `@blog/content` (markdown/images)
- **srcDir**: Core's VitePress config points to `../content` as source directory
- **Content sync**: `npm run sync` scans posts and updates sidebar config automatically
- **Co-located images**: Each post folder contains its own images for markdown use
- Static site only, no SSR

## Adding Content

1. Create folder in `packages/content/posts/my-post/`
2. Add `index.md` and images in same folder
3. Reference images with relative paths: `./image.png`
4. Run `npm run sync` to update sidebar
5. Optionally use frontmatter `order: N` to control sort order

## Image Handling

**Markdown images** (co-located, relative paths):
```md
![screenshot](./image.png)
```

**Vue component images** (public folder, absolute paths):
- Place images in `packages/content/public/images/<post-name>/`
- Reference with absolute path (base URL added automatically):
```md
<ImageCompare before="/images/my-post/before.png" after="/images/my-post/after.png" />
```

## Custom Components

Use in markdown:
```md
<ImageCompare before="/images/my-post/noisy.png" after="/images/my-post/denoised.png" />
```
