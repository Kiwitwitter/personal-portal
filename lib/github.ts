import { withEdgeCache } from './cache'
import type { GitHubContributionDay, GitHubCommitEvent, GitHubStatusData } from './types'

const GITHUB_USERNAME = 'Kiwitwitter'

interface ContributionsApiResponse {
  total?: Record<string, number>
  contributions?: Array<{
    date: string
    count: number
    level: 0 | 1 | 2 | 3 | 4
  }>
}

interface GitHubRawEvent {
  id: string
  type: string
  repo?: { name: string }
  created_at?: string
  payload?: {
    commits?: Array<{ sha: string; message: string }>
    action?: string
    pull_request?: { title?: string; html_url?: string }
  }
}

export async function getGitHubStatus(): Promise<GitHubStatusData | null> {
  return withEdgeCache<GitHubStatusData | null>(
    `github:status:v1:${GITHUB_USERNAME}`,
    async () => {
      try {
        const [contribRes, eventsRes] = await Promise.all([
          fetch(
            `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
            { headers: { Accept: 'application/json' } }
          ).catch(() => null),
          fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=10`,
            {
              headers: {
                Accept: 'application/vnd.github+json',
                'User-Agent': 'pzhng-personal-portal',
              },
            }
          ).catch(() => null),
        ])

        let totalLastYear = 0
        let days: GitHubContributionDay[] = []

        if (contribRes && contribRes.ok) {
          const data = (await contribRes.json()) as ContributionsApiResponse
          totalLastYear = data.total?.lastYear ?? 0
          if (Array.isArray(data.contributions)) {
            days = data.contributions.map((d) => ({
              date: d.date,
              count: d.count,
              level: d.level,
            }))
          }
        }

        const recentEvents: GitHubCommitEvent[] = []
        if (eventsRes && eventsRes.ok) {
          const rawEvents = (await eventsRes.json()) as GitHubRawEvent[]
          if (Array.isArray(rawEvents)) {
            for (const ev of rawEvents) {
              if (recentEvents.length >= 4) break
              const repoName = ev.repo?.name || ''
              if (!repoName) continue

              if (ev.type === 'PushEvent' && ev.payload?.commits?.length) {
                const latestCommit = ev.payload.commits[ev.payload.commits.length - 1]
                const firstLine = (latestCommit.message || '').split('\n')[0].trim()
                if (firstLine) {
                  recentEvents.push({
                    id: ev.id,
                    repo: repoName,
                    message: firstLine,
                    date: ev.created_at || '',
                    url: `https://github.com/${repoName}/commit/${latestCommit.sha}`,
                  })
                }
              } else if (ev.type === 'PullRequestEvent' && ev.payload?.pull_request?.title) {
                recentEvents.push({
                  id: ev.id,
                  repo: repoName,
                  message: `PR (${ev.payload.action || 'updated'}): ${ev.payload.pull_request.title}`,
                  date: ev.created_at || '',
                  url: ev.payload.pull_request.html_url || `https://github.com/${repoName}`,
                })
              }
            }
          }
        }

        if (days.length === 0 && recentEvents.length === 0) {
          return null
        }

        return {
          totalLastYear,
          days,
          recentEvents,
        }
      } catch (error) {
        console.error('Error fetching GitHub status:', error)
        return null
      }
    },
    { freshSeconds: 1800, maxStaleSeconds: 10800 }
  )
}
