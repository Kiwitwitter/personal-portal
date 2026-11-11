import { NextRequest, NextResponse } from 'next/server'
import { withEdgeCache } from '@/lib/cache'
import {
  getKV,
  getWorkersAI,
  getClientFingerprint,
  checkRateLimit,
  sanitizeSingleLine,
} from '@/lib/kv'
import {
  getBlogPosts,
  getBlogPostBySlug,
  getNotionPageContent,
  getStreamPosts,
} from '@/lib/notion'
import { extractArticleDetails } from '@/lib/notion-content'

export const runtime = 'edge'

const PROFILE_CONTEXT = `
Identity: Peng Zhang (Luka), Backend Software Engineer based in the US.
Website: https://pzhng.com | Email: luka@pzhng.com | GitHub: @Kiwitwitter | LinkedIn: in/pzhng

Career History:
- Google (2026 - Present): Backend SDE working on Google Cloud Platform (GCP) One Platform.
- Adobe (2023 - 2026): Backend SDE — Unified API platform aggregating 100+ microservices, context retrieval for AI agents (MCP), dual-pipeline isolation architecture.
- Meta (2022 - 2023): Backend SDE — Global ML infrastructure, fleet management, C++/Rust core services, custom AI accelerator lifecycle.
- Amazon (2019 - 2022): Backend SDE — FairPlay DRM service at 80K-140K TPS, optimized P95 latency from 130ms down to 35ms.

Education:
- M.S. Computer Science, University of Southern California (USC), 2018 (Los Angeles, CA)
- B.E. Internet of Things, Beijing University of Posts and Telecommunications (BUPT), 2016 (Beijing, China)

Technical Stack:
- Languages: Java, C++, Rust, Python, Node.js, TypeScript, SQL
- Distributed Systems: Low-latency APIs, real-time pipelines, event-driven architectures, multi-tenant platforms
- Cloud & Infra: GCP, AWS, Kubernetes, Docker, Kafka, Cloudflare Workers
- Databases: MySQL, MongoDB, Aerospike, DynamoDB

Side Projects:
1. Sales Tax Assistant (iOS App): 100% native Swift & WidgetKit iOS home screen widget for checking US & Canada sales tax rates via GPS, ZIP/postal code, or city with 30-day offline caching (/apps/sales-tax-assistant).
2. Personal Portal (pzhng.com): Open-source terminal-themed developer site built with Next.js 15, Notion CMS, Cloudflare Pages, Workers KV, and Workers AI.
`.trim()

async function runLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
  // 1. Primary: Cloudflare Workers AI binding (zero API key needed on Cloudflare Pages)
  const workersAi = getWorkersAI()
  if (workersAi) {
    try {
      const result = await workersAi.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 380,
        temperature: 0.3,
      })
      if (result?.response?.trim()) {
        return result.response.trim()
      }
    } catch (err) {
      console.error('Workers AI error:', err)
    }
  }

  // 2. Optional secondary: Gemini REST API if GEMINI_API_KEY is configured
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
          }),
        }
      )
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        if (text) return text
      }
    } catch (err) {
      console.error('Gemini fallback error:', err)
    }
  }

  return null
}

function buildLocalAskFallback(
  question: string,
  postsSummary: Array<{ title: string; slug: string; excerpt: string }>
): string {
  const q = question.toLowerCase()
  const isZh = /[\u4e00-\u9fff]/.test(question)

  if (q.includes('blog') || q.includes('post') || q.includes('文章') || q.includes('博客')) {
    if (postsSummary.length > 0) {
      const top = postsSummary
        .slice(0, 3)
        .map((p) => `• ${p.title} (/blog/${p.slug})`)
        .join('\n')
      return isZh
        ? `最近发布的博客文章：\n${top}`
        : `Recent blog posts on pzhng.com:\n${top}`
    }
  }

  if (q.includes('skill') || q.includes('stack') || q.includes('技术') || q.includes('语言')) {
    return isZh
      ? '核心技术栈：Java / C++ / Rust / Python / Node.js，擅长高并发低延迟 API、分布式实时流处理以及 GCP / AWS / Kubernetes 云原生基础设施。'
      : 'Core stack: Java, C++, Rust, Python, Node.js, SQL — focused on low-latency distributed APIs, event-driven pipelines, and GCP/AWS/Kubernetes infrastructure.'
  }

  if (q.includes('project') || q.includes('ios') || q.includes('tax') || q.includes('项目')) {
    return isZh
      ? '代表个人项目包括：1) Sales Tax Assistant（原生 Swift/WidgetKit 开发的北美消费税 iOS 桌面组件）；2) Personal Portal（基于 Next.js + Notion + Cloudflare Edge 的极客终端个人站）。'
      : 'Featured builds: 1) Sales Tax Assistant — a native iOS WidgetKit app for US & Canada sales tax lookup (/apps/sales-tax-assistant); 2) Personal Portal — this Next.js + Notion + Cloudflare Edge site.'
  }

  return isZh
    ? 'Peng Zhang (Luka) 是一名后端与分布式系统工程师，现就职于 Google (GCP One Platform)，曾任 Adobe、Meta、Amazon 后端工程师，毕业于 USC (M.S. CS) 与北京邮电大学。'
    : 'Peng Zhang (Luka) is a Backend Software Engineer at Google (GCP One Platform), previously at Adobe (AI Agent MCP & API Platform), Meta (Global ML Infra in C++/Rust), and Amazon (high-TPS FairPlay DRM). M.S. CS @ USC.'
}

function buildLocalSummaryFallback(title: string, excerpt: string, paragraphs: string[]): string {
  const bullets: string[] = []
  if (excerpt) bullets.push(`• ${excerpt}`)
  for (const p of paragraphs) {
    if (bullets.length >= 3) break
    if (p.length > 30 && p !== title) {
      bullets.push(`• ${p.slice(0, 180)}${p.length > 180 ? '...' : ''}`)
    }
  }
  return bullets.length > 0 ? bullets.join('\n') : `• Overview of "${title}".`
}

export async function POST(request: NextRequest) {
  let body: { mode?: string; question?: string; slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const kv = getKV()
  const fingerprint = await getClientFingerprint(request, 'ai')
  const allowed = await checkRateLimit(kv, fingerprint, 'ai', 15, 60)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 }
    )
  }

  const mode = body.mode || 'ask'

  if (mode === 'summarize') {
    const slug = sanitizeSingleLine(body.slug || '', 128)
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const summary = await withEdgeCache(
      `ai:summary:v1:${slug}`,
      async () => {
        const post = await getBlogPostBySlug(slug)
        if (!post) return null
        const recordMap = await getNotionPageContent(post.id)
        if (!recordMap) return null

        const { plainTextParagraphs } = extractArticleDetails(recordMap, post.id, post.title)
        const articleExcerpt = plainTextParagraphs.join('\n').slice(0, 5500)
        const hasCjk = /[\u4e00-\u9fff]/.test(post.title + articleExcerpt.slice(0, 400))

        const systemPrompt = hasCjk
          ? '你是一名精炼的资深工程师技术编辑。请用中文将文章总结为 3 条简明扼要的核心要点（每条以 "• " 开头，不输出多余寒暄）。'
          : 'You are a concise staff engineer editor. Summarize the article into 3 crisp bullet points (each starting with "• "). Output only the bullet points with no filler.'

        const llmAnswer = await runLLM(
          systemPrompt,
          `Title: ${post.title}\nExcerpt: ${post.excerpt}\n\nContent:\n${articleExcerpt}`
        )

        return (
          llmAnswer ||
          buildLocalSummaryFallback(post.title, post.excerpt, plainTextParagraphs)
        )
      },
      { freshSeconds: 3600, maxStaleSeconds: 86400 }
    )

    if (!summary) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ answer: summary })
  }

  // Default mode: 'ask'
  const question = sanitizeSingleLine(body.question || '', 300)
  if (!question) {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
  }

  const [posts, streamItems] = await Promise.all([getBlogPosts(), getStreamPosts()])
  const postsCatalog = posts
    .filter((p) => Boolean(p.slug))
    .slice(0, 15)
    .map(
      (p) =>
        `- "${p.title}" (/blog/${p.slug}, ${p.date}, tags: [${p.tags.join(', ')}]): ${p.excerpt || ''}`
    )
    .join('\n')

  const recentStreamsCatalog = streamItems
    .slice(0, 8)
    .map((s) => `- [${s.createdAt.slice(0, 10)}] ${s.content.replace(/\s+/g, ' ').slice(0, 220)}`)
    .join('\n')

  const isZh = /[\u4e00-\u9fff]/.test(question)
  const systemPrompt = `${PROFILE_CONTEXT}

Recent Short Thoughts on /stream:
${recentStreamsCatalog || '(No stream updates loaded)'}

Published Blog Posts on pzhng.com:
${postsCatalog || '(No posts loaded)'}

Instructions:
- You are the terminal AI assistant on Peng Zhang's personal website (pzhng.com).
- Answer concisely (2-5 sentences max) in a friendly, sharp engineer tone.
- Reply in ${isZh ? 'Chinese (中文)' : 'the same language as the user question'}.
- Only state facts grounded in the context above; if something isn't mentioned, say so honestly and suggest emailing luka@pzhng.com.`

  const llmAnswer = await runLLM(systemPrompt, question)
  const answer = llmAnswer || buildLocalAskFallback(question, posts)

  return NextResponse.json({ answer })
}
