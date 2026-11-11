import { Container } from '@/components/ui/Container'
import { TerminalHero } from '@/components/home/TerminalHero'
import { TechExperience } from '@/components/home/TechExperience'
import { TechProjects } from '@/components/home/TechProjects'
import { GitHubActivity } from '@/components/home/GitHubActivity'
import { RecentPosts } from '@/components/home/RecentPosts'
import { TechSkills } from '@/components/home/TechSkills'
import { TechEducation } from '@/components/home/TechEducation'
import { getBlogPosts } from '@/lib/notion'
import { getGitHubStatus } from '@/lib/github'

export const runtime = 'edge'

export default async function Home() {
  const [posts, githubStatus] = await Promise.all([
    getBlogPosts(),
    getGitHubStatus(),
  ])

  return (
    <div className="py-12 sm:py-20">
      <Container>
        <TerminalHero />
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
