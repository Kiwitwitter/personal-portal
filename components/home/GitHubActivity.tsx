import { GitCommitHorizontal, ArrowUpRight } from 'lucide-react'
import { formatShortDate } from '@/lib/utils'
import type { GitHubContributionDay, GitHubStatusData } from '@/lib/types'

interface GitHubActivityProps {
  status: GitHubStatusData | null
}

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-[#161b22] border-[#21262d]',
  1: 'bg-[#0e4429] border-[#0e4429]',
  2: 'bg-[#006d32] border-[#006d32]',
  3: 'bg-[#26a641] border-[#26a641]',
  4: 'bg-[#39d353] border-[#39d353]',
}

function groupIntoWeeks(days: GitHubContributionDay[]): GitHubContributionDay[][] {
  const weeks: GitHubContributionDay[][] = []
  let currentWeek: GitHubContributionDay[] = []

  for (const day of days) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }
  return weeks
}

export function GitHubActivity({ status }: GitHubActivityProps) {
  if (!status) return null

  const weeks = groupIntoWeeks(status.days)

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-lg font-mono text-green-500">
          <span>$</span>
          <span className="text-foreground">gh status --user Kiwitwitter</span>
        </div>
        <a
          href="https://github.com/Kiwitwitter"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <span>github.com/Kiwitwitter</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 font-mono space-y-6">
        {/* Contribution Heatmap */}
        {weeks.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>
                <span className="text-primary font-semibold">
                  {status.totalLastYear.toLocaleString()}
                </span>{' '}
                contributions in the last year
              </span>
              <div className="hidden sm:flex items-center gap-1 text-[11px]">
                <span className="mr-1">less</span>
                {([0, 1, 2, 3, 4] as const).map((lvl) => (
                  <span
                    key={lvl}
                    className={`inline-block w-2.5 h-2.5 rounded-[2px] border ${LEVEL_CLASSES[lvl]}`}
                  />
                ))}
                <span className="ml-1">more</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="inline-flex gap-[3px] min-w-max">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.count} contributions on ${day.date}`}
                        className={`w-[11px] h-[11px] rounded-[2px] border ${LEVEL_CLASSES[day.level]} transition-transform hover:scale-125`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Public Commit Stream */}
        {status.recentEvents.length > 0 && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <div className="text-xs text-muted-foreground/70 mb-2">
              {'// recent public activity'}
            </div>
            {status.recentEvents.map((ev) => (
              <a
                key={ev.id}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 text-xs py-1.5 px-2 -mx-2 rounded hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <GitCommitHorizontal className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-blue-400 shrink-0">
                    {ev.repo.replace('Kiwitwitter/', '')}
                  </span>
                  <span className="text-foreground/90 group-hover:text-primary truncate transition-colors">
                    {ev.message}
                  </span>
                </div>
                {ev.date && (
                  <span className="text-muted-foreground/60 shrink-0 tabular-nums pl-5 sm:pl-0">
                    {formatShortDate(ev.date)}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
