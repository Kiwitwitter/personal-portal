import Link from 'next/link'
import { ArrowUpRight, Smartphone, Terminal } from 'lucide-react'

const projects = [
  {
    name: 'Sales Tax Assistant',
    badge: 'iOS App · WidgetKit',
    description:
      '100% native iOS home screen widget & calculator for instant US and Canada sales tax lookup by GPS, ZIP/postal code, or city — with 30-day offline caching.',
    tags: ['Swift', 'WidgetKit', 'CoreLocation', 'iOS 16+'],
    href: '/apps/sales-tax-assistant',
    external: false,
    icon: Smartphone,
  },
  {
    name: 'Personal Portal',
    badge: 'Open Source · Edge',
    description:
      'Terminal-inspired developer portal powered by Next.js App Router, Notion headless CMS, and Cloudflare Pages + Workers KV at the edge.',
    tags: ['Next.js 15', 'TypeScript', 'Notion API', 'Cloudflare KV'],
    href: 'https://github.com/Kiwitwitter/personal-portal',
    external: true,
    icon: Terminal,
  },
]

export const TechProjects = () => {
  return (
    <section className="mb-20">
      <div className="flex items-center gap-2 mb-8 text-lg font-mono text-green-500">
        <span>$</span>
        <span className="text-foreground">ls -la ./projects</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => {
          const Icon = project.icon
          const cardContent = (
            <div className="h-full flex flex-col justify-between bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-all group">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-mono font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>

                <div className="font-mono text-xs text-blue-400 mb-3">{project.badge}</div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {project.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-border/60 font-mono text-xs">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )

          return project.external ? (
            <a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              {cardContent}
            </a>
          ) : (
            <Link key={project.name} href={project.href} className="block h-full">
              {cardContent}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
