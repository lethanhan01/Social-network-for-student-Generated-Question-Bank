import { useState } from 'react'
import { Database, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Page, PageHeader } from '@/components/ui/layout'
import { Heading } from '@/components/ui/typography'
import { Game1Modal, Game4Modal, Game6Panel, GameCard, PredictionHistoryList } from '@/components/gamification'

type ActiveGame = 'game1' | 'game4' | null

export default function MinigamesPage() {
  const { t } = useTranslation('gamification')
  const [activeGame, setActiveGame] = useState<ActiveGame>(null)

  return (
    <Page>
      <PageHeader eyebrow={t('eyebrow')} title={t('minigames.title')} description={t('minigames.description')} />

      <section aria-labelledby="minigames-heading" className="space-y-4">
        <Heading level={2} size="sm" id="minigames-heading">
          {t('minigames.gamesTitle')}
        </Heading>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <li>
            <GameCard
              icon={<Users size={22} />}
              title={t('minigames.game1.title')}
              description={t('minigames.game1.description')}
              joinLabel={t('minigames.join')}
              onJoin={() => setActiveGame('game1')}
            />
          </li>
          <li>
            <GameCard
              icon={<Database size={22} />}
              title={t('minigames.game4.title')}
              description={t('minigames.game4.description')}
              joinLabel={t('minigames.join')}
              onJoin={() => setActiveGame('game4')}
            />
          </li>
        </ul>
        <Game6Panel />
      </section>

      <PredictionHistoryList />

      <Game1Modal open={activeGame === 'game1'} onClose={() => setActiveGame(null)} />
      <Game4Modal open={activeGame === 'game4'} onClose={() => setActiveGame(null)} />
    </Page>
  )
}
