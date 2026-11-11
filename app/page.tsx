import { Container } from '@/components/ui/Container'
import { TerminalHero } from '@/components/home/TerminalHero'
import { TechExperience } from '@/components/home/TechExperience'
import { TechProjects } from '@/components/home/TechProjects'
import { RecentPosts } from '@/components/home/RecentPosts'
import { TechSkills } from '@/components/home/TechSkills'
import { TechEducation } from '@/components/home/TechEducation'
import { getBlogPosts } from '@/lib/notion'

export const runtime = 'edge'

export default async function Home() {
  const posts = await getBlogPosts()

  return (
    <div className="py-12 sm:py-20">
      <Container>
        <TerminalHero />
        <TechExperience />
        <TechProjects />
        <RecentPosts posts={posts} />
        <TechSkills />
        <TechEducation />
      </Container>
    </div>
  )
}
