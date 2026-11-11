import { Github, Mail, Linkedin, Rss } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { EdgeTelemetry } from '@/components/layout/EdgeTelemetry'

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
  {
    href: '/feed.xml',
    icon: Rss,
    label: 'RSS Feed',
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-6 mt-auto bg-card/30">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm text-muted-foreground">
          {/* Copyright + Edge Telemetry */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/50">{`//`}</span>
              <span>&copy; {currentYear} Peng Zhang</span>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <EdgeTelemetry />
          </div>

          {/* Social Links as array */}
          <div className="flex items-center gap-3">
            <span className="text-blue-400 hidden lg:inline">const</span>
            <span className="text-yellow-400 hidden lg:inline">socials</span>
            <span className="hidden lg:inline">=</span>
            <span className="text-muted-foreground hidden lg:inline">[</span>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" />
              </a>
            ))}
            <span className="text-muted-foreground hidden lg:inline">]</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
