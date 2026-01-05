import { Container } from '@/components/ui/Container'
import { TerminalHero } from '@/components/home/TerminalHero'
import { TechExperience } from '@/components/home/TechExperience'
import { TechSkills } from '@/components/home/TechSkills'
import { TechEducation } from '@/components/home/TechEducation'

export default function Home() {
  return (
    <div className="py-12 sm:py-20">
      <Container>
        <TerminalHero />
        <TechExperience />
        <TechSkills />
        <TechEducation />
      </Container>
    </div>
  )
}
