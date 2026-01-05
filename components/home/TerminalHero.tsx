'use client'

import React, { useState, useEffect } from 'react'
import { Github, Mail, Linkedin } from 'lucide-react'

export const TerminalHero = () => {
    const [text, setText] = useState('')
    const fullText = "Hello, I'm Peng Zhang.\nBackend Engineer."

    useEffect(() => {
        let i = 0
        const timer = setInterval(() => {
            setText(fullText.slice(0, i + 1))
            i++
            if (i >= fullText.length) clearInterval(timer)
        }, 50)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="w-full max-w-4xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-2xl">
                {/* Terminal Header */}
                <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <div className="ml-2 text-xs text-muted-foreground font-mono">zsh — pzhng.com</div>
                </div>

                {/* Terminal Body */}
                <div className="p-6 font-mono text-sm sm:text-base">
                    <div className="mb-4">
                        <span className="text-green-500">➜</span> <span className="text-blue-500">~</span> <span className="text-muted-foreground">./welcome.sh</span>
                    </div>

                    <div className="mb-6 min-h-[60px] whitespace-pre-wrap text-foreground">
                        {text}
                        <span className="animate-pulse inline-block w-2 h-5 bg-green-500 align-middle ml-1" />
                    </div>

                    <div className="text-muted-foreground mb-4">
                        <span className="text-green-500">➜</span> <span className="text-blue-500">~</span> <span className="text-muted-foreground">cat social_links.json</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
                </div>
            </div>
        </div>
    )
}
