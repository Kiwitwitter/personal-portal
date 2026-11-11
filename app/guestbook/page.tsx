import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { GuestbookTerminal } from '@/components/guestbook/GuestbookTerminal'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Guestbook | Peng Zhang',
  description: 'Sign the terminal guestbook log on pzhng.com.',
  alternates: {
    canonical: '/guestbook',
  },
}

export default function GuestbookPage() {
  return (
    <div className="py-16">
      <Container>
        <div className="mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-4">
            <span className="text-green-500">$</span>
            <span>tail -f /var/log/guestbook.log</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 font-mono">Guestbook</h1>
          <p className="text-lg text-muted-foreground font-mono">
            <span className="text-blue-400">const</span>{' '}
            <span className="text-yellow-400">log</span> ={' '}
            <span className="text-green-400">
              &quot;leave a one-line packet on the edge&quot;
            </span>
            ;
          </p>
        </div>

        <GuestbookTerminal />
      </Container>
    </div>
  )
}
