import { forwardRef, useId } from 'react'
import type { AvatarSelection } from './avatar-options'

const SKINS = ['#f7d7bd', '#efc29b', '#dca277', '#bd7b52', '#8d573b', '#603b2c']
const HAIR = ['#2f2430', '#6a3f2b', '#c78331', '#e8c45b', '#a94b43', '#5a48a8']
const OUTFITS = [
  ['#6d5efc', '#ebe8ff'], ['#3dbfff', '#e4f7ff'], ['#3ed9a0', '#dcf9ed'],
  ['#ff7b93', '#ffe8ed'], ['#ffc94a', '#fff3c5'], ['#4436bd', '#d9d4ff'],
]
const SHOES = ['#4436bd', '#0878b5', '#178a5c', '#c03955', '#8b5707', '#31394d']

export const AvatarPreview = forwardRef<SVGSVGElement, { selection: AvatarSelection; className?: string }>(
  function AvatarPreview({ selection: s, className }, ref) {
    const stageGradientId = `avatar-stage-${useId().replace(/:/g, '')}`
    const skin = SKINS[s.skin]!
    const hair = HAIR[s.hairColor]!
    const [outfit, trim] = OUTFITS[s.outfit]!
    return (
      <svg ref={ref} viewBox="0 0 360 520" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Avatar đang thiết kế">
        <defs>
          <linearGradient id={stageGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#ebe8ff" />
          </linearGradient>
        </defs>
        <rect width="360" height="520" rx="36" fill={`url(#${stageGradientId})`} />
        <ellipse cx="180" cy="482" rx="104" ry="18" fill="#d9d4ff" />
        <g stroke="#392b62" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: 'stroke fill' }}>
        <path d="M130 448h44v30h-62c0-17 7-26 18-30Zm100 0h-44v30h62c0-17-7-26-18-30Z" fill={SHOES[s.shoes]} />
        <path d="M137 330h86l18 126h-55l-6-75-6 75h-55Z" fill="#35405c" />
        <path d="M106 236q74-35 148 0l-24 119H130Z" fill={outfit} />
        <path d="M130 236q50 24 100 0l-9 38h-82Z" fill={trim} />
        <path d="M108 245q-30 37-31 91c8 8 17 9 26 3l30-79Zm144 0q30 37 31 91c-8 8-17 9-26 3l-30-79Z" fill={skin} />
        <circle cx="91" cy="340" r="17" fill={skin} stroke="none" /><circle cx="269" cy="340" r="17" fill={skin} stroke="none" />
        <rect x="159" y="203" width="42" height="48" rx="18" fill={skin} />
        {s.face === 0 && <ellipse cx="180" cy="145" rx="79" ry="91" fill={skin} />}
        {s.face === 1 && <path d="M180 54c50 0 77 34 77 86 0 58-31 94-77 99-46-5-77-41-77-99 0-52 27-86 77-86Z" fill={skin} />}
        {s.face === 2 && <path d="M180 54c54 0 82 37 77 95-5 55-35 87-77 90-42-3-72-35-77-90-5-58 23-95 77-95Z" fill={skin} />}
        {s.face === 3 && <path d="M180 54c48 0 76 30 76 80 0 61-25 96-76 106-51-10-76-45-76-106 0-50 28-80 76-80Z" fill={skin} />}
        {s.hair === 0 && <path d="M103 143q-6-91 77-96 87 4 78 101-24-7-42-49-43 42-113 44Z" fill={hair} />}
        {s.hair === 1 && <path d="M101 159Q91 45 180 44q91 1 79 116l-30-58q-48 36-128 57Z" fill={hair} />}
        {s.hair === 2 && <><path d="M105 151Q96 48 180 47q84 3 75 104-44-10-71-56-29 45-79 56Z" fill={hair} /><path d="M105 132q-20 95 13 125l24-65m113-60q20 95-13 125l-24-65" fill="none" stroke={hair} strokeWidth="28" /></>}
        {s.hair === 3 && <path d="M102 149q-4-103 78-104 82 1 78 104l-27-44-17 22-26-34-28 35-22-25Z" fill={hair} />}
        {s.hair === 4 && <><path d="M108 141Q103 55 180 52q77 3 72 89-41-2-69-44-25 38-75 44Z" fill={hair} /><circle cx="180" cy="45" r="35" fill={hair} /></>}
        {s.hair === 5 && <><path d="M104 153Q96 53 180 50q84 3 76 103-48-18-76-58-30 40-76 58Z" fill={hair} />{[120,145,171,198,224].map((x) => <circle key={x} cx={x} cy="70" r="18" fill={hair} />)}</>}
        {s.eyes === 0 && <><ellipse cx="148" cy="154" rx="13" ry="17" fill="white" /><ellipse cx="212" cy="154" rx="13" ry="17" fill="white" /><circle cx="148" cy="157" r="7" fill="#29324a" /><circle cx="212" cy="157" r="7" fill="#29324a" /></>}
        {s.eyes === 1 && <><path d="m136 154 11-9 12 9-12 10Z" fill="#29324a" /><path d="m200 154 11-9 12 9-12 10Z" fill="#29324a" /></>}
        {s.eyes === 2 && <><path d="M135 157q13-18 26 0" fill="none" stroke="#29324a" strokeWidth="6" strokeLinecap="round" /><path d="M199 157q13-18 26 0" fill="none" stroke="#29324a" strokeWidth="6" strokeLinecap="round" /></>}
        {s.eyes === 3 && <><text x="134" y="169" fontSize="36" fill="#4436bd">★</text><text x="198" y="169" fontSize="36" fill="#4436bd">★</text></>}
        {s.eyes === 4 && <><circle cx="148" cy="155" r="10" fill="#178a5c" /><circle cx="212" cy="155" r="10" fill="#178a5c" /><circle cx="145" cy="151" r="3" fill="white" /><circle cx="209" cy="151" r="3" fill="white" /></>}
        {s.eyes === 5 && <><path d="M135 154h26M199 154h26" stroke="#29324a" strokeWidth="7" strokeLinecap="round" /><path d="M144 143v-7m13 8 5-6m46 6-5-6m14 5v-7" stroke="#29324a" strokeWidth="4" strokeLinecap="round" /></>}
        {s.expression === 0 && <path d="M158 190q22 18 44 0" fill="none" stroke="#9f2642" strokeWidth="5" strokeLinecap="round" />}
        {s.expression === 1 && <path d="M159 192q21 28 42 0-21 8-42 0Z" fill="#9f2642" />}
        {s.expression === 2 && <path d="M161 197q19-15 38 0" fill="none" stroke="#9f2642" strokeWidth="5" strokeLinecap="round" />}
        {s.expression === 3 && <ellipse cx="180" cy="194" rx="12" ry="15" fill="#9f2642" />}
        {s.expression === 4 && <path d="M159 190q11 14 21 0 11 14 21 0" fill="none" stroke="#9f2642" strokeWidth="5" strokeLinecap="round" />}
        {s.accessory === 1 && <><circle cx="148" cy="155" r="24" fill="none" stroke="#4436bd" strokeWidth="5" /><circle cx="212" cy="155" r="24" fill="none" stroke="#4436bd" strokeWidth="5" /><path d="M172 155h16" stroke="#4436bd" strokeWidth="5" /></>}
        {s.accessory === 2 && <path d="M115 307q65 44 130 0" fill="none" stroke="#ffc94a" strokeWidth="12" />}
        {s.accessory === 3 && <path d="M127 222q53 38 106 0l-12 23q-41 23-82 0Z" fill="#ff7b93" />}
        {s.accessory === 4 && <><circle cx="93" cy="165" r="17" fill="#6d5efc" /><circle cx="267" cy="165" r="17" fill="#6d5efc" /><path d="M93 165q0-92 87-92t87 92" fill="none" stroke="#6d5efc" strokeWidth="8" /></>}
        {s.accessory === 5 && <path d="M228 201q28 11 24 43l-33-16Z" fill="#ffc94a" />}
        {s.hat === 1 && <><path d="M104 84q76-68 152 0v28H104Z" fill="#6d5efc" /><rect x="91" y="102" width="178" height="20" rx="10" fill="#4436bd" /></>}
        {s.hat === 2 && <><path d="M113 94q67-65 134 0Z" fill="#ffc94a" /><circle cx="180" cy="45" r="16" fill="#ff7b93" /></>}
        {s.hat === 3 && <><path d="m120 91 18-64 42 44 42-44 18 64Z" fill="#ffc94a" /><circle cx="138" cy="31" r="7" fill="#6d5efc" /><circle cx="222" cy="31" r="7" fill="#6d5efc" /></>}
        {s.hat === 4 && <><path d="M100 98q80-76 160 0Z" fill="#3ed9a0" /><path d="M180 49v-24m0 0c24 1 33 14 33 14-15 11-33 10-33-14Z" fill="#178a5c" /></>}
        {s.hat === 5 && <><path d="M106 101q74-58 148 0Z" fill="#f5f3ff" stroke="#3dbfff" strokeWidth="7" /><circle cx="180" cy="45" r="17" fill="#3dbfff" /></>}
        </g>
        <g aria-hidden="true">
          <ellipse cx="132" cy="178" rx="13" ry="7" fill="#ff9b9b" opacity=".28" />
          <ellipse cx="228" cy="178" rx="13" ry="7" fill="#ff9b9b" opacity=".28" />
          <path d="M176 173q5 4 10 0" fill="none" stroke="#b86f55" strokeWidth="3" strokeLinecap="round" opacity=".7" />
          <path d="M125 261q18-13 35-2M235 261q-18-13-35-2" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity=".32" />
          <path d="M150 343q30 10 60 0" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity=".18" />
        </g>
      </svg>
    )
  },
)
