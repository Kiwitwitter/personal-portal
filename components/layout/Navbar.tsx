'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Github, Mail, Linkedin, FileText } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/gallery', label: 'Gallery' },
]

const socialLinks = [
  {
    href: 'https://github.com/Kiwitwitter',
    icon: Github,
    label: 'GitHub',
  },
  {
    href: 'mailto:luka@pzhng.com',
    icon: Mail,
    label: 'Email',
  },
  {
    href: 'https://linkedin.com/in/pzhng',
    icon: Linkedin,
    label: 'LinkedIn',
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight hover:text-primary transition-colors font-mono group"
          >
            ~/pzhng
            <span className="animate-pulse text-primary inline-block ml-1">_</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Nav Links */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-sm font-medium transition-all duration-200 font-mono group relative',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    )}
                  >
                    {isActive ? (
                      <span>[ {link.label} ]</span>
                    ) : (
                      <span className="group-hover:before:content-['>_'] group-hover:before:text-primary group-hover:before:mr-1">
                        {link.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Resume Button */}
            <a
              href="/PengZhang_CV_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all font-mono group"
            >
              <span className="text-primary mr-1 group-hover:animate-pulse">$</span>
              ./cv.pdf
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary font-mono',
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <hr className="border-border" />

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={link.label}
                  >
                    <link.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Resume Button */}
              <a
                href="/PengZhang_CV_2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors w-fit font-mono"
              >
                <FileText className="w-4 h-4" />
                CV
              </a>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
