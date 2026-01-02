# Personal Portal - Product Requirements Document (PRD)

## 1. Project Overview

A minimalist personal website built with Next.js 14, featuring a dark-themed aesthetic with light/dark mode toggle. Content is managed via Notion and rendered using react-notion-x.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **CMS**: Notion API (`@notionhq/client` + `notion-client`)
- **Renderer**: `react-notion-x`
- **Fonts**: Inter (body) + JetBrains Mono (code)
- **Deployment**: Cloudflare Pages
- **Language**: English only

---

## 2. Site Structure

```
/                    → Home (About page - personal introduction)
/blog                → Blog/Projects list with categories & tags
/blog/[slug]         → Individual blog post / project page
/gallery             → Photography gallery (Instagram-style grid)
```

### Navigation Bar (Fixed)
- Logo / Name
- Home | Blog | Gallery
- Social links (GitHub, Email, LinkedIn)
- Resume download button
- Theme toggle (dark/light)

### Footer
- Copyright
- Social links (repeated)
- "Built with Next.js & Notion"

---

## 3. Page Specifications

### 3.1 Home Page (`/`)
The home page IS the About page - direct personal introduction.

**Content:**
- Hero section with name and tagline
- Brief bio / introduction paragraph
- Key skills or focus areas
- Optional: Featured projects or recent blog posts

**Data Source:** Notion page (single page, not database)

---

### 3.2 Blog Page (`/blog`)
Lists all blog posts and projects from a Notion database.

**Features:**
- Category filter (tabs or dropdown)
- Tag filter (clickable tags)
- Search (optional, Phase 2)
- Pagination or infinite scroll
- Card layout showing:
  - Title
  - Date
  - Category
  - Tags
  - Cover image (optional)
  - Excerpt

**Data Source:** Notion Database with properties:
- Title (title)
- Slug (rich_text)
- Date (date)
- Category (select)
- Tags (multi_select)
- Published (checkbox)
- Cover (files)
- Excerpt (rich_text)

**Rendering:** ISR with 60-second revalidation

---

### 3.3 Blog Post Page (`/blog/[slug]`)
Individual post/project rendered from Notion.

**Features:**
- Full Notion page content via react-notion-x
- Code blocks with syntax highlighting
- Images with lazy loading
- Table of contents (optional)
- Previous/Next post navigation
- Back to blog link

**Data Source:** Individual Notion page

**Rendering:** ISR with 60-second revalidation

---

### 3.4 Gallery Page (`/gallery`)
Instagram-style photography showcase.

**Layout:** Masonry grid (responsive columns)

**Features:**
- Hover effect showing caption
- Click to open lightbox (full-size image)
- Caption text below enlarged image
- Smooth transitions

**Data Source:** Notion Database with properties:
- Image (files)
- Caption (rich_text)
- Date (date)
- Order (number, optional)

---

## 4. Design System

### Colors (Dark Theme - Default)
```css
--background: #0a0a0a
--foreground: #fafafa
--card: #18181b
--card-foreground: #fafafa
--primary: #3b82f6  /* blue-500 */
--muted: #27272a
--muted-foreground: #a1a1aa
--border: #27272a
```

### Colors (Light Theme)
```css
--background: #ffffff
--foreground: #0a0a0a
--card: #f4f4f5
--card-foreground: #0a0a0a
--primary: #2563eb  /* blue-600 */
--muted: #f4f4f5
--muted-foreground: #71717a
--border: #e4e4e7
```

### Typography
- **Body**: Inter (400, 500, 600)
- **Code**: JetBrains Mono (400, 500)
- **Headings**: Inter (600, 700)

### Spacing
- Use Tailwind's default spacing scale
- Consistent padding: 4, 6, 8, 12, 16, 24

---

## 5. Project File Structure

```
personal-portal/
├── app/
│   ├── layout.tsx              # Root layout with fonts, theme provider
│   ├── page.tsx                # Home/About page
│   ├── globals.css             # Tailwind + custom styles
│   ├── blog/
│   │   ├── page.tsx            # Blog list page
│   │   └── [slug]/
│   │       └── page.tsx        # Individual blog post
│   └── gallery/
│       └── page.tsx            # Gallery page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── TagFilter.tsx
│   ├── gallery/
│   │   ├── MasonryGrid.tsx
│   │   └── Lightbox.tsx
│   ├── notion/
│   │   └── NotionRenderer.tsx  # react-notion-x wrapper
│   ├── ui/
│   │   ├── ThemeToggle.tsx
│   │   ├── Button.tsx
│   │   └── Container.tsx
│   └── home/
│       └── Hero.tsx
├── lib/
│   ├── notion.ts               # Notion API client & helpers
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Utility functions
├── public/
│   ├── resume.pdf              # Resume file
│   └── images/                 # Static images
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Notion Database Setup

### Blog Database Properties
| Property | Type | Description |
|----------|------|-------------|
| Title | title | Post title |
| Slug | rich_text | URL slug (e.g., "my-first-post") |
| Date | date | Publication date |
| Category | select | Category (e.g., "Project", "Blog", "Note") |
| Tags | multi_select | Tags for filtering |
| Published | checkbox | Publication status |
| Cover | files | Cover image |
| Excerpt | rich_text | Short description |

### Gallery Database Properties
| Property | Type | Description |
|----------|------|-------------|
| Image | files | Photo file |
| Caption | rich_text | Image caption |
| Date | date | Photo date |
| Published | checkbox | Show in gallery |

---

## 7. Environment Variables

```env
NOTION_TOKEN=secret_xxx
NOTION_BLOG_DATABASE_ID=xxx
NOTION_GALLERY_DATABASE_ID=xxx
NOTION_ABOUT_PAGE_ID=xxx
```

---

## 8. Implementation Phases

### Phase 1: Foundation
1. Initialize Next.js 14 project with TypeScript
2. Configure Tailwind CSS with custom theme
3. Set up fonts (Inter + JetBrains Mono)
4. Create basic layout (Navbar + Footer)
5. Implement theme toggle (dark/light)
6. Set up Notion client (`lib/notion.ts`)

### Phase 2: Core Pages
1. Build Home/About page
2. Build Blog list page with filters
3. Build Blog post page with react-notion-x
4. Implement ISR for all pages

### Phase 3: Gallery
1. Create Masonry grid component
2. Build Lightbox component
3. Connect to Notion gallery database
4. Implement image optimization

### Phase 4: Polish
1. Add loading states
2. Add error handling
3. SEO optimization (meta tags, OG images)
4. Performance optimization
5. Cloudflare Pages deployment setup

---

## 9. Key Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "@notionhq/client": "^2.x",
    "notion-client": "^6.x",
    "react-notion-x": "^6.x",
    "prismjs": "^1.x",
    "next-themes": "^0.x",
    "react-photo-album": "^2.x",
    "yet-another-react-lightbox": "^3.x"
  }
}
```

---

## 10. Notes

- **Cloudflare Pages Compatibility**: Use `next-on-pages` for deployment
- **Image Optimization**: Use Cloudflare Images or external image optimization service (Notion images need proxy)
- **react-notion-x**: Requires `notion-client` (unofficial) for full page content, not just `@notionhq/client`
