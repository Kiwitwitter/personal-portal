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
    <footer className="border-t border-border py-8 mt-auto">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Peng Zhang. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={link.label}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Built with */}
          <p className="text-sm text-muted-foreground">
            Built with{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Next.js
            </a>{' '}
            &{' '}
            <a
              href="https://notion.so"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Notion
            </a>
          </p>
        </div>
      </Container>
    </footer>
  )
}
