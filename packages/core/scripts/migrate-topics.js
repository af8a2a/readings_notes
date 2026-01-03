import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOPICS_DIR = path.resolve(__dirname, '../../../Topics')
const POSTS_DIR = path.resolve(__dirname, '../../content/posts')

// Convert filename to kebab-case folder name
function toKebabCase(str) {
  return str
    .replace(/\.md$/, '')
    .replace(/&/g, '-and-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

// Convert filename to title
function toTitle(str) {
  return str
    .replace(/\.md$/, '')
    .replace(/&/g, ' & ')
}

// Migrate files
function migrate() {
  if (!fs.existsSync(TOPICS_DIR)) {
    console.error('Topics directory not found')
    process.exit(1)
  }

  const files = fs.readdirSync(TOPICS_DIR).filter(f => f.endsWith('.md'))
  console.log(`Found ${files.length} files to migrate\n`)

  for (const file of files) {
    const sourcePath = path.join(TOPICS_DIR, file)
    const folderName = toKebabCase(file)
    const title = toTitle(file)
    const destDir = path.join(POSTS_DIR, folderName)
    const destPath = path.join(destDir, 'index.md')

    // Create destination folder
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    // Read original content
    const content = fs.readFileSync(sourcePath, 'utf-8')

    // Check if content already has frontmatter
    const hasFrontmatter = content.startsWith('---')

    // Create new content with frontmatter
    let newContent
    if (hasFrontmatter) {
      newContent = content
    } else {
      newContent = `---
title: "${title}"
---

# ${title}

${content}`
    }

    // Write to destination
    fs.writeFileSync(destPath, newContent)
    console.log(`✓ ${file} → posts/${folderName}/`)
  }

  console.log('\nMigration complete! Run "npm run sync" to update sidebar.')
}

migrate()
