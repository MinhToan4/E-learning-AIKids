import { Link } from 'react-router-dom'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'

type LegalKind = 'hub' | 'privacy' | 'terms' | 'delete' | 'support' | 'data-safety'

type Section = {
  title: string
  body: React.ReactNode
}

const contact = <a className="font-bold text-brand-600 underline" href="mailto:storymee.com@gmail.com">storymee.com@gmail.com</a>

const privacySections: Section[] = [
  {
    title: '1. ─É╞ín vß╗ï vß║¡n h├ánh',
    body: <>AI Kid (ΓÇ£ch├║ng t├┤iΓÇ¥) cung cß║Ñp nß╗ün tß║úng hß╗ìc tß║¡p v├á s├íng tß║ío AI cho gia ─æ├¼nh, gi├ío vi├¬n v├á tß╗ò chß╗⌐c. Li├¬n hß╗ç vß╗ü quyß╗ün ri├¬ng t╞░: {contact}.</>,
  },
  {
    title: '2. Dß╗» liß╗çu ─æ╞░ß╗úc thu thß║¡p',
    body: (
      <ul>
        <li>T├ái khoß║ún ng╞░ß╗¥i lß╗¢n: t├¬n, email, t├¬n ─æ─âng nhß║¡p, vai tr├▓ v├á mß║¡t khß║⌐u ─æ├ú b─âm.</li>
        <li>Hß╗ô s╞í trß║╗: biß╗çt danh, nh├│m tuß╗òi, ß║únh ─æß║íi diß╗çn, t├╣y chß╗ìn hß╗ìc tß║¡p v├á tiß║┐n ─æß╗Ö.</li>
        <li>Nß╗Öi dung: c├óu lß╗çnh, tranh, truyß╗çn, nh├ón vß║¡t, tß╗çp tham chiß║┐u v├á sß║ún phß║⌐m hß╗ìc tß║¡p.</li>
        <li>Hoß║ít ─æß╗Öng kß╗╣ thuß║¡t: phi├¬n ─æ─âng nhß║¡p, trß║íng th├íi t├íc vß╗Ñ, phi├¬n bß║ún ß╗⌐ng dß╗Ñng, lß╗ùi v├á chß║⌐n ─æo├ín mß║íng c╞í bß║ún.</li>
        <li>Camera/th╞░ viß╗çn ß║únh chß╗ë ─æ╞░ß╗úc truy cß║¡p khi ng╞░ß╗¥i d├╣ng chß╗º ─æß╗Öng chß╗ìn t├¡nh n─âng t╞░╞íng ß╗⌐ng.</li>
      </ul>
    ),
  },
  {
    title: '3. Mß╗Ñc ─æ├¡ch sß╗¡ dß╗Ñng',
    body: <>Dß╗» liß╗çu ─æ╞░ß╗úc d├╣ng ─æß╗â x├íc thß╗▒c, cung cß║Ñp kh├│a hß╗ìc, l╞░u tiß║┐n ─æß╗Ö, tß║ío nß╗Öi dung, bß║úo vß╗ç t├ái khoß║ún, hß╗ù trß╗ú ng╞░ß╗¥i d├╣ng, ng─ân lß║ím dß╗Ñng v├á duy tr├¼ ─æß╗Ö ß╗òn ─æß╗ïnh cß╗ºa dß╗ïch vß╗Ñ. AI Kid kh├┤ng b├ín dß╗» liß╗çu c├í nh├ón.</>,
  },
  {
    title: '4. AI v├á nh├á cung cß║Ñp dß╗ïch vß╗Ñ',
    body: <>Khi ng╞░ß╗¥i d├╣ng chß╗º ─æß╗Öng tß║ío nß╗Öi dung, prompt v├á tß╗çp tham chiß║┐u cß║ºn thiß║┐t c├│ thß╗â ─æ╞░ß╗úc gß╗¡i tß╗¢i nh├á cung cß║Ñp AI/media ─æ╞░ß╗úc AI Kid cß║Ñu h├¼nh. Dß╗» liß╗çu c┼⌐ng c├│ thß╗â ─æ╞░ß╗úc xß╗¡ l├╜ bß╗ƒi nh├á cung cß║Ñp hosting, l╞░u trß╗», c╞í sß╗ƒ dß╗» liß╗çu, th├┤ng b├ío v├á x├íc thß╗▒c. C├íc b├¬n n├áy chß╗ë ─æ╞░ß╗úc sß╗¡ dß╗Ñng dß╗» liß╗çu ─æß╗â cung cß║Ñp dß╗ïch vß╗Ñ theo y├¬u cß║ºu.</>,
  },
  {
    title: '5. Trß║╗ em v├á sß╗▒ ─æß╗ông ├╜ cß╗ºa phß╗Ñ huynh',
    body: <>T├ái khoß║ún gia ─æ├¼nh do phß╗Ñ huynh/ng╞░ß╗¥i gi├ím hß╗Ö tß║ío v├á quß║ún l├╜. Trß║╗ kh├┤ng cß║ºn cung cß║Ñp email ri├¬ng. Phß╗Ñ huynh kiß╗âm so├ít hß╗ô s╞í trß║╗, quyß╗ün tß║ío nß╗Öi dung, chia sß║╗ v├á x├│a dß╗» liß╗çu. Ch├║ng t├┤i giß║úm thiß╗âu dß╗» liß╗çu trß║╗ em v├á mß║╖c ─æß╗ïnh sß║ún phß║⌐m ß╗ƒ chß║┐ ─æß╗Ö ri├¬ng t╞░.</>,
  },
  {
    title: '6. L╞░u trß╗» v├á x├│a dß╗» liß╗çu',
    body: <>Dß╗» liß╗çu ─æ╞░ß╗úc giß╗» trong thß╗¥i gian t├ái khoß║ún hoß║ít ─æß╗Öng hoß║╖c khi cß║ºn ─æß╗â cung cß║Ñp dß╗ïch vß╗Ñ. Khi nhß║¡n y├¬u cß║ºu x├│a hß╗úp lß╗ç, ch├║ng t├┤i x├│a hoß║╖c ß║⌐n danh dß╗» liß╗çu, ngoß║íi trß╗½ hß╗ô s╞í tß╗æi thiß╗âu phß║úi giß╗» trong thß╗¥i hß║ín cß║ºn thiß║┐t cho an ninh, chß╗æng gian lß║¡n, giao dß╗ïch hoß║╖c ngh─⌐a vß╗Ñ ph├íp luß║¡t. Xem <Link className="font-bold text-brand-600 underline" to="/account/delete">h╞░ß╗¢ng dß║½n x├│a t├ái khoß║ún</Link>.</>,
  },
  {
    title: '7. Quyß╗ün v├á lß╗▒a chß╗ìn',
    body: <>Ng╞░ß╗¥i d├╣ng c├│ thß╗â xem, sß╗¡a hoß║╖c x├│a th├┤ng tin trong ß╗⌐ng dß╗Ñng; y├¬u cß║ºu truy cß║¡p, chß╗ënh sß╗¡a, xuß║Ñt, hß║ín chß║┐ xß╗¡ l├╜ hoß║╖c r├║t lß║íi sß╗▒ ─æß╗ông ├╜ bß║▒ng c├ích li├¬n hß╗ç {contact}. Mß╗Öt sß╗æ quyß╗ün phß╗Ñ thuß╗Öc v├áo khu vß╗▒c ph├íp l├╜.</>,
  },
  {
    title: '8. Bß║úo mß║¡t v├á chuyß╗ân dß╗» liß╗çu',
    body: <>Ch├║ng t├┤i sß╗¡ dß╗Ñng HTTPS, mß║¡t khß║⌐u ─æ├ú b─âm, ph├ón quyß╗ün, giß╗¢i hß║ín phi├¬n v├á API c├│ kiß╗âm so├ít truy cß║¡p. Nh├á cung cß║Ñp c├│ thß╗â xß╗¡ l├╜ dß╗» liß╗çu ß╗ƒ quß╗æc gia kh├íc; ch├║ng t├┤i ├íp dß╗Ñng biß╗çn ph├íp bß║úo vß╗ç ph├╣ hß╗úp vß╗¢i ph├íp luß║¡t ├íp dß╗Ñng.</>,
  },
  {
    title: '9. Cß║¡p nhß║¡t ch├¡nh s├ích',
    body: <>C├íc thay ─æß╗òi quan trß╗ìng sß║╜ ─æ╞░ß╗úc c├┤ng bß╗æ tß║íi trang n├áy c├╣ng ng├áy hiß╗çu lß╗▒c mß╗¢i. Ng├áy hiß╗çu lß╗▒c hiß╗çn tß║íi: 23/07/2026.</>,
  },
]

const termsSections: Section[] = [
  { title: '1. Chß║Ñp thuß║¡n ─æiß╗üu khoß║ún', body: <>Bß║▒ng viß╗çc tß║ío t├ái khoß║ún hoß║╖c sß╗¡ dß╗Ñng AI Kid, bß║ín ─æß╗ông ├╜ vß╗¢i ─Éiß╗üu khoß║ún n├áy v├á <Link className="font-bold text-brand-600 underline" to="/privacy">Ch├¡nh s├ích quyß╗ün ri├¬ng t╞░</Link>.</> },
  { title: '2. T├ái khoß║ún gia ─æ├¼nh v├á tß╗ò chß╗⌐c', body: <>Chß╗º t├ái khoß║ún phß║úi c├│ n─âng lß╗▒c giao kß║┐t ph├╣ hß╗úp. Phß╗Ñ huynh/ng╞░ß╗¥i gi├ím hß╗Ö chß╗ïu tr├ích nhiß╗çm gi├ím s├ít hß╗ô s╞í trß║╗; tß╗ò chß╗⌐c chß╗ïu tr├ích nhiß╗çm ph├ón quyß╗ün gi├ío vi├¬n, quß║ún trß╗ï vi├¬n v├á hß╗ìc sinh cß╗ºa m├¼nh.</> },
  { title: '3. Nß╗Öi dung ng╞░ß╗¥i d├╣ng', body: <>Bß║ín giß╗» quyß╗ün ─æß╗æi vß╗¢i nß╗Öi dung ─æ├ú tß║úi l├¬n v├á cß║Ñp cho AI Kid quyß╗ün giß╗¢i hß║ín ─æß╗â l╞░u trß╗», xß╗¡ l├╜, truyß╗ün v├á hiß╗ân thß╗ï nß╗Öi dung nhß║▒m vß║¡n h├ánh dß╗ïch vß╗Ñ. Bß║ín phß║úi c├│ quyß╗ün sß╗¡ dß╗Ñng nß╗Öi dung ─æ├ú cung cß║Ñp.</> },
  { title: '4. Nß╗Öi dung do AI tß║ío', body: <>Kß║┐t quß║ú AI c├│ thß╗â kh├┤ng ch├¡nh x├íc, kh├┤ng duy nhß║Ñt hoß║╖c bß╗ï giß╗¢i hß║ín bß╗ƒi ch├¡nh s├ích cß╗ºa nh├á cung cß║Ñp. Ng╞░ß╗¥i d├╣ng phß║úi kiß╗âm tra kß║┐t quß║ú tr╞░ß╗¢c khi sß╗¡ dß╗Ñng hoß║╖c chia sß║╗.</> },
  { title: '5. Sß╗¡ dß╗Ñng ─æ╞░ß╗úc chß║Ñp nhß║¡n', body: <>Kh├┤ng ─æ╞░ß╗úc tß║ío hoß║╖c tß║úi l├¬n nß╗Öi dung bß║Ñt hß╗úp ph├íp, x├óm hß║íi trß║╗ em, x├óm phß║ím quyß╗ün cß╗ºa ng╞░ß╗¥i kh├íc; kh├┤ng tß║Ñn c├┤ng hß╗ç thß╗æng, v╞░ß╗út giß╗¢i hß║ín, giß║ú mß║ío hoß║╖c sß╗¡ dß╗Ñng dß╗ïch vß╗Ñ ─æß╗â g├óy hß║íi. T├ái khoß║ún vi phß║ím c├│ thß╗â bß╗ï ─æ├¼nh chß╗ë.</> },
  { title: '6. G├│i dß╗ïch vß╗Ñ v├á b├¬n thß╗⌐ ba', body: <>Mß╗Öt sß╗æ t├¡nh n─âng phß╗Ñ thuß╗Öc v├áo nh├á cung cß║Ñp AI, media, thanh to├ín hoß║╖c hß║í tß║ºng b├¬n thß╗⌐ ba. T├¡nh n─âng v├á giß╗¢i hß║ín c├│ thß╗â thay ─æß╗òi; quyß╗ün lß╗úi ─æ├ú thanh to├ín ─æ╞░ß╗úc xß╗¡ l├╜ theo m├┤ tß║ú tß║íi thß╗¥i ─æiß╗âm mua v├á quy ─æß╗ïnh cß╗ºa cß╗¡a h├áng ß╗⌐ng dß╗Ñng.</> },
  { title: '7. Chß║Ñm dß╗⌐t v├á x├│a t├ái khoß║ún', body: <>Bß║ín c├│ thß╗â ngß╗½ng sß╗¡ dß╗Ñng hoß║╖c y├¬u cß║ºu x├│a t├ái khoß║ún tß║íi <Link className="font-bold text-brand-600 underline" to="/account/delete">trang x├│a t├ái khoß║ún</Link>. Ch├║ng t├┤i c├│ thß╗â hß║ín chß║┐ t├ái khoß║ún ─æß╗â bß║úo vß╗ç ng╞░ß╗¥i d├╣ng hoß║╖c tu├ón thß╗º ph├íp luß║¡t.</> },
  { title: '8. Giß╗¢i hß║ín bß║úo ─æß║úm', body: <>Dß╗ïch vß╗Ñ ─æ╞░ß╗úc cung cß║Ñp tr├¬n c╞í sß╗ƒ ΓÇ£nh╞░ hiß╗çn c├│ΓÇ¥ trong phß║ím vi ph├íp luß║¡t cho ph├⌐p. AI Kid kh├┤ng bß║úo ─æß║úm dß╗ïch vß╗Ñ lu├┤n kh├┤ng gi├ín ─æoß║ín hoß║╖c mß╗ìi kß║┐t quß║ú AI ph├╣ hß╗úp cho mß╗Öt mß╗Ñc ─æ├¡ch cß╗Ñ thß╗â.</> },
  { title: '9. Li├¬n hß╗ç', body: <>C├óu hß╗Åi vß╗ü ─æiß╗üu khoß║ún: {contact}. Ng├áy hiß╗çu lß╗▒c: 23/07/2026.</> },
]

const pageMeta: Record<LegalKind, { title: string; intro: string }> = {
  hub: { title: 'Th├┤ng tin ph├íp l├╜ AI Kid', intro: 'C├íc ch├¡nh s├ích v├á k├¬nh hß╗ù trß╗ú ch├¡nh thß╗⌐c d├ánh cho ng╞░ß╗¥i d├╣ng, phß╗Ñ huynh v├á ─æ╞ín vß╗ï tr╞░ß╗¥ng hß╗ìc.' },
  privacy: { title: 'Ch├¡nh s├ích quyß╗ün ri├¬ng t╞░', intro: 'C├ích AI Kid thu thß║¡p, sß╗¡ dß╗Ñng, bß║úo vß╗ç v├á x├│a dß╗» liß╗çu.' },
  terms: { title: '─Éiß╗üu khoß║ún sß╗¡ dß╗Ñng', intro: 'Quyß╗ün v├á tr├ích nhiß╗çm khi sß╗¡ dß╗Ñng ß╗⌐ng dß╗Ñng v├á dß╗ïch vß╗Ñ AI Kid.' },
  delete: { title: 'X├│a t├ái khoß║ún v├á dß╗» liß╗çu', intro: 'Y├¬u cß║ºu x├│a t├ái khoß║ún AI Kid v├á dß╗» liß╗çu li├¬n quan.' },
  support: { title: 'Hß╗ù trß╗ú ng╞░ß╗¥i d├╣ng', intro: 'K├¬nh hß╗ù trß╗ú ch├¡nh thß╗⌐c cho t├ái khoß║ún, hß╗ìc tß║¡p, thanh to├ín v├á an to├án.' },
  'data-safety': { title: 'An to├án dß╗» liß╗çu', intro: 'Bß║ún t├│m tß║»t thß╗▒c h├ánh dß╗» liß╗çu d├╣ng ─æß╗â ─æß╗æi chiß║┐u vß╗¢i khai b├ío cß╗¡a h├áng ß╗⌐ng dß╗Ñng.' },
}

function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.title} className="ui-card p-5 sm:p-6">
          <h2 className="font-display text-xl text-text">{section.title}</h2>
          <div className="mt-2 space-y-2 text-sm leading-7 text-muted [&_li]:ml-5 [&_li]:list-disc">{section.body}</div>
        </section>
      ))}
    </div>
  )
}

export function LegalPage({ kind }: { kind: LegalKind }) {
  const meta = pageMeta[kind]
  let content: React.ReactNode

  if (kind === 'privacy') content = <Sections sections={privacySections} />
  else if (kind === 'terms') content = <Sections sections={termsSections} />
  else if (kind === 'delete') {
    content = <Sections sections={[
      { title: 'X├│a trß╗▒c tiß║┐p trong ß╗⌐ng dß╗Ñng', body: <>─É─âng nhß║¡p t├ái khoß║ún phß╗Ñ huynh, mß╗ƒ Hß╗ô s╞í ΓåÆ X├│a t├ái khoß║ún, x├íc nhß║¡n mß║¡t khß║⌐u v├á l├ám theo h╞░ß╗¢ng dß║½n. Phß╗Ñ huynh c┼⌐ng c├│ thß╗â x├│a ri├¬ng tß╗½ng hß╗ô s╞í trß║╗ trong mß╗Ñc Con cß╗ºa t├┤i.</> },
      { title: 'Gß╗¡i y├¬u cß║ºu qua email', body: <>Nß║┐u kh├┤ng thß╗â ─æ─âng nhß║¡p, gß╗¡i email tß╗½ ─æß╗ïa chß╗ë ─æ├ú ─æ─âng k├╜ tß╗¢i {contact} vß╗¢i ti├¬u ─æß╗ü ΓÇ£Y├¬u cß║ºu x├│a t├ái khoß║ún AI KidΓÇ¥. Kh├┤ng gß╗¡i mß║¡t khß║⌐u hoß║╖c PIN. Ch├║ng t├┤i c├│ thß╗â y├¬u cß║ºu th├┤ng tin tß╗æi thiß╗âu ─æß╗â x├íc minh quyß╗ün sß╗ƒ hß╗»u.</> },
      { title: 'Dß╗» liß╗çu sß║╜ bß╗ï x├│a', body: <>T├ái khoß║ún, hß╗ô s╞í trß║╗, phi├¬n ─æ─âng nhß║¡p, tiß║┐n ─æß╗Ö, sß║ún phß║⌐m v├á tß╗çp c├í nh├ón li├¬n kß║┐t sß║╜ bß╗ï x├│a hoß║╖c ß║⌐n danh. Hß╗ô s╞í tß╗æi thiß╗âu vß╗ü giao dß╗ïch, an ninh hoß║╖c ngh─⌐a vß╗Ñ ph├íp luß║¡t c├│ thß╗â ─æ╞░ß╗úc giß╗» trong thß╗¥i hß║ín bß║»t buß╗Öc rß╗ôi x├│a an to├án.</> },
      { title: 'Thß╗¥i gian xß╗¡ l├╜', body: <>Y├¬u cß║ºu hß╗úp lß╗ç th╞░ß╗¥ng ─æ╞░ß╗úc ho├án tß║Ñt trong v├▓ng 30 ng├áy. Quyß╗ün truy cß║¡p c├│ thß╗â bß╗ï v├┤ hiß╗çu h├│a sß╗¢m h╞ín. Ch├║ng t├┤i sß║╜ th├┤ng b├ío nß║┐u ph├íp luß║¡t cho ph├⌐p k├⌐o d├ái thß╗¥i gian xß╗¡ l├╜.</> },
    ]} />
  } else if (kind === 'support') {
    content = <Sections sections={[
      { title: 'Li├¬n hß╗ç', body: <>Email: {contact}. Vui l├▓ng m├┤ tß║ú thiß║┐t bß╗ï, phi├¬n bß║ún ß╗⌐ng dß╗Ñng v├á lß╗ùi gß║╖p phß║úi; kh├┤ng gß╗¡i mß║¡t khß║⌐u, PIN hoß║╖c kh├│a API.</> },
      { title: 'An to├án trß║╗ em', body: <>Phß╗Ñ huynh hoß║╖c gi├ío vi├¬n c├│ thß╗â b├ío c├ío ngay nß╗Öi dung kh├┤ng ph├╣ hß╗úp qua email vß╗¢i ti├¬u ─æß╗ü ΓÇ£An to├án trß║╗ emΓÇ¥. Nß╗Öi dung v├á quyß╗ün chia sß║╗ mß║╖c ─æß╗ïnh ─æ╞░ß╗úc giß╗¢i hß║ín ─æß╗â bß║úo vß╗ç trß║╗.</> },
      { title: 'T├ái khoß║ún v├á dß╗» liß╗çu', body: <>Xem <Link className="font-bold text-brand-600 underline" to="/privacy">Ch├¡nh s├ích quyß╗ün ri├¬ng t╞░</Link> hoß║╖c <Link className="font-bold text-brand-600 underline" to="/account/delete">gß╗¡i y├¬u cß║ºu x├│a t├ái khoß║ún</Link>.</> },
    ]} />
  } else if (kind === 'data-safety') {
    content = <Sections sections={[
      { title: 'Dß╗» liß╗çu c├│ thß╗â ─æ╞░ß╗úc thu thß║¡p', body: <>T├¬n/biß╗çt danh, email ng╞░ß╗¥i lß╗¢n, ID t├ái khoß║ún, nß╗Öi dung do ng╞░ß╗¥i d├╣ng tß║ío, ß║únh/tß╗çp ng╞░ß╗¥i d├╣ng chß╗º ─æß╗Öng chß╗ìn, hoß║ít ─æß╗Öng ß╗⌐ng dß╗Ñng, th├┤ng tin thiß║┐t bß╗ï v├á chß║⌐n ─æo├ín c╞í bß║ún.</> },
      { title: 'Mß╗Ñc ─æ├¡ch', body: <>Chß╗⌐c n─âng ß╗⌐ng dß╗Ñng, quß║ún l├╜ t├ái khoß║ún, c├í nh├ón h├│a hß╗ìc tß║¡p, bß║úo mß║¡t/chß╗æng gian lß║¡n, hß╗ù trß╗ú, ph├ón t├¡ch ─æß╗Ö ß╗òn ─æß╗ïnh v├á tß║ío nß╗Öi dung theo y├¬u cß║ºu.</> },
      { title: 'Chia sß║╗ v├á bß║úo vß╗ç', body: <>Kh├┤ng b├ín dß╗» liß╗çu. Dß╗» liß╗çu chß╗ë ─æ╞░ß╗úc truyß╗ün cho hß║í tß║ºng hoß║╖c nh├á cung cß║Ñp AI cß║ºn thiß║┐t ─æß╗â thß╗▒c hiß╗çn t├¡nh n─âng. Dß╗» liß╗çu ─æ╞░ß╗úc m├ú h├│a khi truyß╗ün; ng╞░ß╗¥i d├╣ng c├│ thß╗â y├¬u cß║ºu x├│a.</> },
      { title: 'L╞░u ├╜ cho khai b├ío cß╗¡a h├áng', body: <>Trang n├áy l├á bß║ún t├│m tß║»t c├┤ng khai. Khai b├ío Data Safety/App Privacy phß║úi bao qu├ít ch├¡nh x├íc mß╗ìi SDK v├á h├ánh vi trong tß╗½ng bß║ún ph├ít h├ánh cß╗ºa ß╗⌐ng dß╗Ñng.</> },
    ]} />
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['/privacy', 'Quyß╗ün ri├¬ng t╞░', 'Dß╗» liß╗çu ─æ╞░ß╗úc thu thß║¡p, mß╗Ñc ─æ├¡ch, quyß╗ün v├á thß╗¥i gian l╞░u giß╗».'],
          ['/terms', '─Éiß╗üu khoß║ún sß╗¡ dß╗Ñng', 'Quy tß║»c t├ái khoß║ún, nß╗Öi dung v├á dß╗ïch vß╗Ñ AI.'],
          ['/account/delete', 'X├│a t├ái khoß║ún', 'H╞░ß╗¢ng dß║½n y├¬u cß║ºu x├│a t├ái khoß║ún v├á dß╗» liß╗çu.'],
          ['/data-safety', 'An to├án dß╗» liß╗çu', 'T├│m tß║»t khai b├ío dß╗» liß╗çu cho cß╗¡a h├áng ß╗⌐ng dß╗Ñng.'],
          ['/support', 'Hß╗ù trß╗ú', 'K├¬nh hß╗ù trß╗ú t├ái khoß║ún, nß╗Öi dung v├á an to├án trß║╗ em.'],
        ].map(([to, title, description]) => (
          <Link key={to} to={to} className="ui-card p-5 transition hover:-translate-y-0.5 hover:border-brand-300">
            <h2 className="font-display text-xl text-brand-600">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" aria-label="Vß╗ü trang ch├¡nh"><BrandLogo size="md" /></Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-brand-600" aria-label="Th├┤ng tin ph├íp l├╜">
            <Link to="/privacy">Quyß╗ün ri├¬ng t╞░</Link>
            <Link to="/terms">─Éiß╗üu khoß║ún</Link>
            <Link to="/account/delete">X├│a t├ái khoß║ún</Link>
            <Link to="/support">Hß╗ù trß╗ú</Link>
          </nav>
        </header>
        <div className="mb-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand-500">AI Kid ┬╖ Th├┤ng tin c├┤ng khai</p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-text sm:text-4xl">{meta.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{meta.intro}</p>
        </div>
        {content}
        <footer className="mt-8 border-t border-border py-6 text-sm text-muted">
          <Link className="font-bold text-brand-600" to="/legal">Trung t├óm ph├íp l├╜</Link>
          {' ┬╖ '}┬⌐ 2026 AI Kid{' ┬╖ '}{contact}
        </footer>
      </div>
    </div>
  )
}
