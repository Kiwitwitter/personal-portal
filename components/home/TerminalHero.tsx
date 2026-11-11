'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Mail, Linkedin } from 'lucide-react'
import { triggerCommandPalette } from '@/components/ui/CommandPalette'

interface HistoryEntry {
  id: number
  command: string
  output: React.ReactNode
}

const AVAILABLE_COMMANDS = [
  'help',
  'whoami',
  'ls',
  'cd blog',
  'cd gallery',
  'projects',
  'skills',
  'git log',
  'cv',
  'contact',
  'search',
  'clear',
]

export const TerminalHero = () => {
  const router = useRouter()
  const [text, setText] = useState('')
  const [introDone, setIntroDone] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyCursor, setHistoryCursor] = useState<number>(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  const fullText = "Hello, I'm Peng Zhang.\nBackend Engineer."

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) {
        clearInterval(timer)
        setIntroDone(true)
      }
    }, 45)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (history.length > 0) {
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [history])

  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim()
    if (!trimmed) return

    setCmdHistory((prev) => [...prev, trimmed])
    setHistoryCursor(-1)

    const lower = trimmed.toLowerCase()

    if (lower === 'clear' || lower === 'cls') {
      setHistory([])
      setInput('')
      return
    }

    let output: React.ReactNode = null

    if (lower === 'help' || lower === '?') {
      output = (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <div><span className="text-primary">whoami</span> — bio &amp; current role</div>
          <div><span className="text-primary">ls</span> — list site directories</div>
          <div><span className="text-primary">cd blog</span> — open blog timeline</div>
          <div><span className="text-primary">cd gallery</span> — open photo gallery</div>
          <div><span className="text-primary">projects</span> — list featured builds</div>
          <div><span className="text-primary">skills</span> — print tech stack</div>
          <div><span className="text-primary">git log</span> — career commit history</div>
          <div><span className="text-primary">cv</span> — open resume PDF</div>
          <div><span className="text-primary">search</span> — open ⌘K search palette</div>
          <div><span className="text-primary">clear</span> — clear terminal output</div>
        </div>
      )
    } else if (lower === 'whoami') {
      output = (
        <div className="text-muted-foreground space-y-1">
          <p>
            <span className="text-foreground font-semibold">Peng Zhang (Luka)</span> — Backend Software Engineer @ Google (GCP One Platform).
          </p>
          <p>Previously built high-scale distributed systems &amp; AI infrastructure at Adobe, Meta, and Amazon.</p>
        </div>
      )
    } else if (lower === 'ls' || lower === 'ls -la' || lower === 'ls -l') {
      output = (
        <div className="flex flex-wrap gap-4 text-sm">
          <button
            type="button"
            onClick={() => router.push('/blog')}
            className="text-blue-400 hover:underline"
          >
            drwxr-xr-x blog/
          </button>
          <button
            type="button"
            onClick={() => router.push('/gallery')}
            className="text-blue-400 hover:underline"
          >
            drwxr-xr-x gallery/
          </button>
          <button
            type="button"
            onClick={() => router.push('/apps/sales-tax-assistant')}
            className="text-blue-400 hover:underline"
          >
            drwxr-xr-x apps/sales-tax-assistant/
          </button>
          <a
            href="/PengZhang_CV_2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline"
          >
            -rwxr-xr-x cv.pdf*
          </a>
        </div>
      )
    } else if (lower === 'cd blog' || lower === 'cd ./blog' || lower === 'blog') {
      output = <span className="text-green-400">Navigating to ~/pzhng/blog ...</span>
      setTimeout(() => router.push('/blog'), 180)
    } else if (lower === 'cd gallery' || lower === 'cd ./gallery' || lower === 'gallery') {
      output = <span className="text-green-400">Navigating to ~/pzhng/gallery ...</span>
      setTimeout(() => router.push('/gallery'), 180)
    } else if (
      lower === 'cd apps/sales-tax-assistant' ||
      lower === 'cd sales-tax-assistant'
    ) {
      output = (
        <span className="text-green-400">
          Navigating to ~/pzhng/apps/sales-tax-assistant ...
        </span>
      )
      setTimeout(() => router.push('/apps/sales-tax-assistant'), 180)
    } else if (lower === 'cd ~' || lower === 'cd /' || lower === 'cd ..' || lower === 'cd') {
      output = <span className="text-muted-foreground">Already at ~/pzhng</span>
    } else if (lower === 'projects' || lower === 'ls projects' || lower === 'ls ./projects') {
      output = (
        <div className="space-y-1 text-muted-foreground">
          <div>
            <span className="text-green-400">→</span>{' '}
            <button
              type="button"
              onClick={() => router.push('/apps/sales-tax-assistant')}
              className="text-foreground underline hover:text-primary"
            >
              Sales Tax Assistant (iOS)
            </button>{' '}
            — Native iOS home screen widget for US &amp; Canada sales tax rates
          </div>
          <div>
            <span className="text-green-400">→</span>{' '}
            <a
              href="https://github.com/Kiwitwitter/personal-portal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline hover:text-primary"
            >
              Personal Portal
            </a>{' '}
            — Next.js 15 + Notion CMS + Cloudflare Edge &amp; KV
          </div>
        </div>
      )
    } else if (lower === 'skills' || lower === 'cat skills.ts') {
      output = (
        <div className="text-muted-foreground space-y-0.5 text-xs sm:text-sm">
          <div><span className="text-blue-300">languages:</span> Java, C++, Rust, Python, Node.js, SQL</div>
          <div><span className="text-blue-300">systems:</span> Low-latency APIs, Real-time Pipelines, Event-driven, Multi-tenant</div>
          <div><span className="text-blue-300">cloud:</span> GCP, AWS, Kubernetes, Docker, Kafka</div>
          <div><span className="text-blue-300">databases:</span> MySQL, MongoDB, Aerospike, DynamoDB</div>
        </div>
      )
    } else if (lower === 'git log' || lower === 'exp' || lower === 'cat experience.log') {
      output = (
        <div className="text-muted-foreground space-y-0.5 text-xs sm:text-sm">
          <div><span className="text-yellow-500">a1b2c3</span> Google — Backend SDE (2026 - Present)</div>
          <div><span className="text-yellow-500">7a8b9c</span> Adobe — Backend SDE (2023 - 2026)</div>
          <div><span className="text-yellow-500">3e4f5a</span> Meta — Backend SDE (2022 - 2023)</div>
          <div><span className="text-yellow-500">1b2c3d</span> Amazon — Backend SDE (2019 - 2022)</div>
        </div>
      )
    } else if (lower === 'cv' || lower === './cv.pdf' || lower === 'open cv') {
      output = <span className="text-green-400">Opening PengZhang_CV_2026.pdf ...</span>
      window.open('/PengZhang_CV_2026.pdf', '_blank', 'noopener,noreferrer')
    } else if (lower === 'contact' || lower === 'cat social_links.json') {
      output = (
        <div className="text-muted-foreground text-xs sm:text-sm">
          email: <a href="mailto:luka@pzhng.com" className="text-primary hover:underline">luka@pzhng.com</a> · github:{' '}
          <a href="https://github.com/Kiwitwitter" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Kiwitwitter</a> · linkedin:{' '}
          <a href="https://linkedin.com/in/pzhng" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">in/pzhng</a>
        </div>
      )
    } else if (lower === 'search' || lower === 'grep') {
      output = <span className="text-green-400">Opening command palette (⌘K)...</span>
      setTimeout(() => triggerCommandPalette(), 80)
    } else if (lower === 'date') {
      output = <span className="text-muted-foreground">{new Date().toString()}</span>
    } else if (lower.startsWith('uname')) {
      output = (
        <span className="text-muted-foreground">
          Darwin pzhng.edge 24.0.0 Cloudflare-Workers arm64
        </span>
      )
    } else if (lower.startsWith('sudo')) {
      output = (
        <span className="text-yellow-400">
          guest is not in the sudoers file. This incident will be politely ignored.
        </span>
      )
    } else {
      output = (
        <span className="text-red-400">
          zsh: command not found: {trimmed}. Type <span className="text-primary">help</span> for available commands.
        </span>
      )
    }

    setHistory((prev) => [
      ...prev,
      {
        id: nextId.current++,
        command: trimmed,
        output,
      },
    ])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const nextCursor =
        historyCursor === -1 ? cmdHistory.length - 1 : Math.max(0, historyCursor - 1)
      setHistoryCursor(nextCursor)
      setInput(cmdHistory[nextCursor])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyCursor === -1) return
      if (historyCursor >= cmdHistory.length - 1) {
        setHistoryCursor(-1)
        setInput('')
      } else {
        const nextCursor = historyCursor + 1
        setHistoryCursor(nextCursor)
        setInput(cmdHistory[nextCursor])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const current = input.trim().toLowerCase()
      if (!current) return
      const match = AVAILABLE_COMMANDS.find((cmd) => cmd.startsWith(current))
      if (match) {
        setInput(match)
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      setHistory([])
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div
        className="rounded-lg border border-border bg-card overflow-hidden shadow-2xl"
        onClick={(e) => {
          // Focus input unless user clicked an interactive link/button or selected text
          const target = e.target as HTMLElement
          if (target.closest('a, button')) return
          if (window.getSelection()?.toString()) return
          inputRef.current?.focus()
        }}
      >
        {/* Terminal Header */}
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="ml-2 text-xs text-muted-foreground font-mono">zsh — pzhng.com</div>
          </div>
          <span className="hidden sm:inline text-[11px] font-mono text-muted-foreground/70">
            interactive shell · type &apos;help&apos;
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-sm sm:text-base">
          <div className="mb-4">
            <span className="text-green-500">➜</span> <span className="text-blue-500">~</span>{' '}
            <span className="text-muted-foreground">./welcome.sh</span>
          </div>

          <div className="mb-6 min-h-[56px] whitespace-pre-wrap text-foreground">
            {text}
            {!introDone && (
              <span className="animate-pulse inline-block w-2 h-5 bg-green-500 align-middle ml-1" />
            )}
          </div>

          <div className="text-muted-foreground mb-4">
            <span className="text-green-500">➜</span> <span className="text-blue-500">~</span>{' '}
            <span className="text-muted-foreground">cat social_links.json</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6">
            <a
              href="https://github.com/Kiwitwitter"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
            >
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-blue-400">&quot;GitHub&quot;</span>
            </a>
            <a
              href="mailto:luka@pzhng.com"
              className="group flex items-center gap-3 p-3 rounded hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
            >
              <Mail className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-blue-400">&quot;Email&quot;</span>
            </a>
            <a
              href="https://linkedin.com/in/pzhng"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
            >
              <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-blue-400">&quot;LinkedIn&quot;</span>
            </a>
          </div>

          {/* Interactive Session History */}
          {history.length > 0 && (
            <div className="space-y-3 mb-4 pt-3 border-t border-border/50 max-h-64 overflow-y-auto">
              {history.map((entry) => (
                <div key={entry.id} className="space-y-1.5">
                  <div>
                    <span className="text-green-500">➜</span>{' '}
                    <span className="text-blue-500">~</span>{' '}
                    <span className="text-foreground">{entry.command}</span>
                  </div>
                  <div className="pl-4 text-sm">{entry.output}</div>
                </div>
              ))}
              <div ref={outputEndRef} />
            </div>
          )}

          {/* Live Interactive Prompt */}
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-green-500 shrink-0">➜</span>
              <span className="text-blue-500 shrink-0">~</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type 'help' or press Enter..."
                aria-label="Terminal command input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/45 focus:outline-none text-sm sm:text-base"
              />
            </div>

            {/* Quick Command Chips */}
            <div className="flex items-center gap-2 flex-wrap mt-3 text-xs text-muted-foreground/70">
              <span>try:</span>
              {(['help', 'whoami', 'ls', 'projects', 'cd blog'] as const).map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeCommand(cmd)}
                  className="px-2 py-0.5 rounded bg-muted/60 border border-border hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
