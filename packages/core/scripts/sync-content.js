import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.resolve(__dirname, '../../content')
const POSTS_DIR = path.join(CONTENT_DIR, 'posts')
const CONFIG_FILE = path.resolve(__dirname, '../.vitepress/config.mts')

// Extract title from markdown frontmatter or first heading
function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // Try frontmatter title
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    const titleMatch = frontmatterMatch[1].match(/title:\s*["']?([^"'\n]+)["']?/)
    if (titleMatch) return titleMatch[1].trim()
  }

  // Try first h1 heading
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) return h1Match[1].trim()

  // Fallback to folder/filename
  return path.basename(path.dirname(filePath))
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// Extract order from frontmatter (optional)
function extractOrder(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    const orderMatch = frontmatterMatch[1].match(/order:\s*(\d+)/)
    if (orderMatch) return parseInt(orderMatch[1])
  }
  return 999
}

// Check if directory is a post folder (has index.md, no other .md files)
function isPostFolder(dir) {
  const indexPath = path.join(dir, 'index.md')
  if (!fs.existsSync(indexPath)) return false

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    // Has other markdown files = section folder
    if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
      return false
    }
    // Has subdirectory with index.md = section folder
    if (entry.isDirectory()) {
      const subIndex = path.join(dir, entry.name, 'index.md')
      if (fs.existsSync(subIndex)) return false
    }
  }
  return true
}

// Scan posts directory
function scanPosts(dir, basePath = '/posts') {
  const items = []

  if (!fs.existsSync(dir)) {
    console.log(`Creating posts directory: ${dir}`)
    fs.mkdirSync(dir, { recursive: true })
    return items
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const linkPath = `${basePath}/${entry.name.replace(/\.md$/, '')}`

    if (entry.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.md')
      const hasIndex = fs.existsSync(indexPath)

      if (isPostFolder(fullPath)) {
        // Single post with co-located images
        items.push({
          text: extractTitle(indexPath),
          link: linkPath + '/',
          order: extractOrder(indexPath)
        })
      } else if (hasIndex) {
        // Section with children
        const children = scanPosts(fullPath, linkPath)
        items.push({
          text: extractTitle(indexPath),
          collapsed: false,
          link: linkPath + '/',
          items: children,
          order: extractOrder(indexPath)
        })
      } else {
        // Section without index
        const children = scanPosts(fullPath, linkPath)
        if (children.length > 0) {
          items.push({
            text: entry.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            collapsed: false,
            items: children,
            order: 999
          })
        }
      }
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      // Standalone markdown file
      items.push({
        text: extractTitle(fullPath),
        link: linkPath,
        order: extractOrder(fullPath)
      })
    }
  }

  // Sort by order, then alphabetically
  items.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.text.localeCompare(b.text)
  })

  // Remove order field from output
  return items.map(({ order, ...rest }) => rest)
}

// Generate sidebar config
function generateSidebar() {
  const posts = scanPosts(POSTS_DIR)

  return [
    {
      text: 'Posts',
      items: posts
    }
  ]
}

// Update config file
function updateConfig() {
  const sidebar = generateSidebar()
  const sidebarJson = JSON.stringify(sidebar, null, 6)
    .replace(/"([^"]+)":/g, '$1:')  // Remove quotes from keys
    .replace(/"/g, "'")              // Use single quotes

  let config = fs.readFileSync(CONFIG_FILE, 'utf-8')

  // Replace sidebar section
  const sidebarRegex = /sidebar:\s*\[[\s\S]*?\n\s*\],/
  const newSidebar = `sidebar: ${sidebarJson},`

  if (sidebarRegex.test(config)) {
    config = config.replace(sidebarRegex, newSidebar)
  } else {
    console.error('Could not find sidebar section in config')
    process.exit(1)
  }

  fs.writeFileSync(CONFIG_FILE, config)
  console.log('✓ Sidebar config updated')
  console.log(`  Found ${countPosts(sidebar[0].items)} posts`)
}

function countPosts(items) {
  let count = 0
  for (const item of items) {
    if (item.items) {
      count += countPosts(item.items)
    } else {
      count++
    }
  }
  return count
}

// Run
updateConfig()
