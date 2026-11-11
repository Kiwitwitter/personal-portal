import { Container } from '@/components/ui/Container'
import { TerminalHero } from '@/components/home/TerminalHero'
import { LatestThoughtBar } from '@/components/home/LatestThoughtBar'
import { TechExperience } from '@/components/home/TechExperience'
import { TechProjects } from '@/components/home/TechProjects'
import { GitHubActivity } from '@/components/home/GitHubActivity'
import { RecentPosts } from '@/components/home/RecentPosts'
import { TechSkills } from '@/components/home/TechSkills'
import { TechEducation } from '@/components/home/TechEducation'
import { getBlogPosts, getStreamPosts } from '@/lib/notion'
import { getGitHubStatus } from '@/lib/github'

export const runtime = 'edge'

export default async function Home() {
  const [posts, streamItems, githubStatus] = await Promise.all([
    getBlogPosts(),
    getStreamPosts(),
    getGitHubStatus(),
  ])

  const latestStream =
    [...streamItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] || undefined

  return (
    <div className="py-12 sm:py-20">
      <Container>
        <TerminalHero />
        <LatestThoughtBar item={latestStream} />
        <TechExperience />
        <TechProjects />
        <GitHubActivity status={githubStatus} />
        <RecentPosts posts={posts} />
        <TechSkills />
        <TechEducation />
      </Container>
    </div>
  )
}
