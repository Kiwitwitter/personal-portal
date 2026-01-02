import { Container } from '@/components/ui/Container'
import { Github, Mail, Linkedin, MapPin } from 'lucide-react'

const experience = [
  {
    company: 'Adobe',
    role: 'Backend Software Development Engineer',
    period: 'Sept 2023 – Present',
    location: 'San Jose, CA',
    highlights: [
      'Public API Platform: Unified API aggregation layer consolidating 100+ microservice calls',
      'AI Agent Infrastructure (MCP): Real-time context retrieval system for AI agents',
      'Pipeline Isolation Architecture: Dual-pipeline system eliminating multi-tenant blocking',
    ],
  },
  {
    company: 'Meta',
    role: 'Backend Software Development Engineer',
    period: 'Apr 2022 – June 2023',
    location: 'Menlo Park, CA',
    highlights: [
      'AI Infrastructure (C++/Rust): Core services for global ML training and inference fleet',
      'Accelerator Enablement: GPU driver lifecycle and custom accelerator management',
    ],
  },
  {
    company: 'Amazon',
    role: 'Backend Software Development Engineer',
    period: 'Aug 2019 – Mar 2022',
    location: 'Santa Clara, CA',
    highlights: [
      'FairPlay DRM (Tech Lead): End-to-end DRM service, reduced P95 latency from 130ms to 35ms',
      'Streaming Platform: Distributed infrastructure handling 80K-140K TPS',
    ],
  },
]

const skills = {
  languages: ['Java', 'C++', 'Rust', 'Python', 'Node.js', 'SQL'],
  systems: ['Low-latency APIs', 'Real-time Pipelines', 'Event-driven Systems', 'Multi-tenant Architecture'],
  cloud: ['AWS', 'Kubernetes', 'Docker', 'Kafka'],
  databases: ['MySQL', 'MongoDB', 'Aerospike', 'DynamoDB'],
}

const education = [
  {
    school: 'University of Southern California',
    degree: 'M.S. Computer Science',
    year: '2018',
    location: 'Los Angeles, CA',
  },
  {
    school: 'Beijing University of Posts and Telecommunications',
    degree: 'B.E. Internet of Things',
    year: '2016',
    location: 'Beijing, China',
  },
]

export default function Home() {
  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Hero Section */}
        <section className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Peng Zhang
          </h1>
          <p className="text-xl sm:text-2xl text-primary font-medium mb-4">
            Backend Engineer | Distributed Systems
          </p>
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <MapPin className="w-4 h-4" />
            <span>Bay Area, CA</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Backend engineer with 6 years of experience building low-latency, high-throughput
            distributed systems at scale. Specialized in real-time data pipelines, API platform
            architecture, and performance optimization serving 100M+ users.
          </p>

          {/* Quick Links */}
          <div className="flex items-center gap-4 mt-6">
            <a
              href="https://github.com/Kiwitwitter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href="mailto:luka@pzhng.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </a>
            <a
              href="https://linkedin.com/in/pzhng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn</span>
            </a>
          </div>
        </section>

        {/* Experience Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Experience</h2>
          <div className="space-y-8">
            {experience.map((job) => (
              <div key={job.company} className="border-l-2 border-border pl-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-lg font-semibold">{job.company}</h3>
                  <span className="text-sm text-muted-foreground">{job.period}</span>
                </div>
                <p className="text-muted-foreground mb-2">{job.role}</p>
                <p className="text-sm text-muted-foreground mb-3">{job.location}</p>
                <ul className="space-y-2">
                  {job.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8">Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {skills.languages.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-muted rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Distributed Systems</h3>
              <div className="flex flex-wrap gap-2">
                {skills.systems.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-muted rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Cloud & Infrastructure</h3>
              <div className="flex flex-wrap gap-2">
                {skills.cloud.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-muted rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Databases</h3>
              <div className="flex flex-wrap gap-2">
                {skills.databases.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-muted rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-8">Education</h2>
          <div className="space-y-6">
            {education.map((edu) => (
              <div key={edu.school} className="border-l-2 border-border pl-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                  <h3 className="font-semibold">{edu.school}</h3>
                  <span className="text-sm text-muted-foreground">{edu.year}</span>
                </div>
                <p className="text-muted-foreground">{edu.degree}</p>
                <p className="text-sm text-muted-foreground">{edu.location}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  )
}
