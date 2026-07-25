import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'

export function WelcomePage() {
  return (
    <div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-8 px-4 py-10"
      style={{
        backgroundImage: `url(${designerAssets.lobby.bgHome})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px]" />
      <div className="ui-card relative z-10 grid w-full max-w-5xl overflow-hidden md:grid-cols-2">
        <div className="relative min-h-72 bg-brand-100">
          <img
            src={designerAssets.lobby.homeCharacter}
            alt="Nh├ón vß║¡t s├íng tß║ío tß╗½ designer AIKid"
            className="h-full w-full object-cover"
          />
          {/* Wordmark only ΓÇö no frame/border around logo */}
          <BrandLogo
            size="lg"
            className="absolute left-4 top-4 max-w-[160px] drop-shadow-md"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <BrandLogo size="xl" className="max-w-[min(100%,300px)]" />
          <p className="text-sm font-bold uppercase tracking-wide text-brand-500">
            8ΓÇô11 tuß╗òi ┬╖ Hß╗ìc qua ch╞íi ┬╖ Designer AIKid
          </p>
          <h1 className="font-display text-4xl leading-tight text-text md:text-5xl">
            Creator Academy
          </h1>
          <p className="text-muted">
            Kh├┤ng phß║úi lß╗¢p hß╗ìc kh├┤ khan ΓÇö con ─æi bß║ún ─æß╗ô nhiß╗çm vß╗Ñ, gh├⌐p thß║╗ prompt, l├ám
            truyß╗çn tranh / giß╗ìng kß╗â / robot, hiß╗âu bß║ún chß║Ñt AI qua thß╗▒c h├ánh an to├án.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/login">
              <Button>Bß║»t ─æß║ºu ngay</Button>
            </Link>
            <Link to="/login?role=parent">
              <Button variant="secondary">T├┤i l├á ba/mß║╣</Button>
            </Link>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              designerAssets.lobby.cardArt,
              designerAssets.lobby.cardMee,
              designerAssets.lobby.artComic,
            ].map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-16 w-full rounded-xl object-cover shadow-soft"
              />
            ))}
          </div>
          <p className="text-xs text-muted">
            Kh├┤ng d├╣ng email cß╗ºa trß║╗ ┬╖ S├íng tß║ío mß║╖c ─æß╗ïnh ri├¬ng t╞░ ┬╖ C├│ cß╗òng duyß╗çt phß╗Ñ huynh
          </p>
          <nav className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-brand-600" aria-label="Th├┤ng tin ph├íp l├╜">
            <Link to="/privacy">Quyß╗ün ri├¬ng t╞░</Link>
            <Link to="/terms">─Éiß╗üu khoß║ún</Link>
            <Link to="/account/delete">X├│a t├ái khoß║ún</Link>
            <Link to="/support">Hß╗ù trß╗ú</Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
