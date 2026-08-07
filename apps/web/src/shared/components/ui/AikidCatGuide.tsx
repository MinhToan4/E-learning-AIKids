type AikidCatGuideProps = {
  className?: string
}

/** Compact in-product mascot; decorative unless a parent supplies nearby copy. */
export function AikidCatGuide({ className }: AikidCatGuideProps) {
  return (
    <svg className={className} viewBox="0 0 240 220" fill="none" aria-hidden="true">
      <path d="M42 89L31 30C28 17 42 8 53 15L91 39" fill="#FFFDFC" />
      <path d="M198 89L209 30C212 17 198 8 187 15L149 39" fill="#FF941F" />
      <path d="M36 102C36 55 74 25 120 25C166 25 204 55 204 102V158C204 193 172 211 120 211C68 211 36 193 36 158V102Z" fill="#FFFDFC" />
      <path d="M120 25C166 25 204 55 204 102V126L164 145C139 157 112 139 112 111V72C112 52 116 36 120 25Z" fill="#FFA21F" />
      <path d="M50 45L58 78L82 57L50 45Z" fill="#FFA21F" />
      <path d="M190 45L182 78L158 57L190 45Z" fill="#FF7D0A" />
      <path d="M74 93C74 82 82 74 92 74C102 74 110 82 110 93M130 93C130 82 138 74 148 74C158 74 166 82 166 93" stroke="#F47A00" strokeWidth="6" strokeLinecap="round" />
      <path d="M111 108H129L120 119L111 108Z" fill="#F47A00" />
      <path d="M120 118V125" stroke="#F47A00" strokeWidth="5" strokeLinecap="round" />
      <path d="M66 151C80 165 94 171 108 171M174 151C160 165 146 171 132 171" stroke="#FFA21F" strokeWidth="18" strokeLinecap="round" />
    </svg>
  )
}
