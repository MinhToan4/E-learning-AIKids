import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'
import type { WorkshopStep } from '../lib/workshop-types'

type HubCard = {
  id: WorkshopStep
  label: string
  desc: string
  img: string
  comingSoon?: boolean
}

const HUB_CARDS: HubCard[] = [
  {
    id: 'style',
    label: 'Vß║╜ Tranh AI',
    desc: 'Vß║╜ ph├íc thß║úo, chß╗ìn phong c├ích rß╗ôi ─æß╗â AI biß║┐n n├│ th├ánh t├íc phß║⌐m nghß╗ç thuß║¡t.',
    img: designerAssets.workshop.comic,
  },
  {
    id: 'character',
    label: 'Nh├ón Vß║¡t AI',
    desc: 'Chß╗ìn h├¼nh d├íng, khu├┤n mß║╖t v├á trang phß╗Ñc rß╗ôi tß║ío ng╞░ß╗¥i bß║ín AI cß╗ºa ri├¬ng con.',
    img: designerAssets.workshop.character,
  },
  {
    id: 'story-mode',
    label: 'S├íng T├íc Truyß╗çn',
    desc: 'Chß╗ìn Truyß╗çn chß╗» hoß║╖c Truyß╗çn tranh, rß╗ôi c├╣ng AI ph├ít triß╗ân ├╜ t╞░ß╗ƒng.',
    img: designerAssets.workshop.mee,
  },
]

type Props = {
  onGo: (step: WorkshopStep) => void
}

export function WorkshopHub({ onGo }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <img
          src={designerAssets.brand.mascot}
          alt="Mascot AI Kids"
          className="h-14 w-14 rounded-2xl object-cover shadow-soft"
        />
        <div>
          <h1 className="font-display text-3xl text-text">X╞░ß╗ƒng S├íng Tß║ío</h1>
          <p className="mt-1 text-sm text-muted">
            H├┤m nay con muß╗æn tß║ío ra ─æiß╗üu g├¼? Chß╗ìn mß╗Öt hoß║ít ─æß╗Öng b├¬n d╞░ß╗¢i nh├⌐!
          </p>
        </div>
      </div>

      {/* Cards ΓÇö natural height, no stretching */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {HUB_CARDS.map((card) => (
          <button
            key={card.id + card.label}
            type="button"
            disabled={card.comingSoon}
            onClick={() => !card.comingSoon && onGo(card.id)}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-3xl border-2 text-left transition',
              card.comingSoon
                ? 'cursor-not-allowed border-border bg-white opacity-60'
                : 'border-border bg-white shadow-soft hover:border-brand-400 hover:shadow-clay active:scale-[0.98]',
            )}
          >
            {/* Cover image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
              <img
                src={card.img}
                alt=""
                aria-hidden
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {card.comingSoon && (
                <div className="absolute inset-0 flex items-center justify-center bg-text/30 backdrop-blur-sm">
                  <span className="rounded-full bg-sun-400 px-3 py-1 text-xs font-extrabold text-text">
                    Sß║»p ra mß║»t
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 p-4">
              <h2 className="font-display text-xl text-text">{card.label}</h2>
              <p className="flex-1 text-sm text-muted">{card.desc}</p>
              {!card.comingSoon && (
                <div className="mt-3 flex items-center gap-1 text-sm font-extrabold text-brand-600">
                  Bß║»t ─æß║ºu <ChevronRight size={14} />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
