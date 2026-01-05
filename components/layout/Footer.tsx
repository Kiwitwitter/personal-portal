import { Github, Mail, Linkedin } from 'lucide-react'
import { Container } from '@/components/ui/Container'

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

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-6 mt-auto bg-card/30">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm text-muted-foreground">
          {/* Copyright as comment */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/50">//</span>
            <span>&copy; {currentYear} Peng Zhang</span>
          </div>

          {/* Built with as object */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-blue-400">const</span>
            <span className="text-yellow-400">stack</span>
            <span>=</span>
            <span className="text-muted-foreground">{`{`}</span>
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">"Next.js"</a>
            <span>,</span>
            <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">"Notion"</a>
            <span className="text-muted-foreground">{`}`}</span>
          </div>

          {/* Social Links as array */}
          <div className="flex items-center gap-3">
            <span className="text-blue-400 hidden sm:inline">const</span>
            <span className="text-yellow-400 hidden sm:inline">socials</span>
            <span className="hidden sm:inline">=</span>
            <span className="text-muted-foreground hidden sm:inline">[</span>
            {socialLinks.map((link, index) => (
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
            <span className="text-muted-foreground hidden sm:inline">]</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
