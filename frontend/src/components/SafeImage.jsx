import { useState } from 'react'

// SafeImage — like <img>, but:
//  - if `src` is empty/null, shows a styled placeholder immediately
//  - if the URL fails to load, swaps to the placeholder instead of showing
//    the browser's broken-image icon
//
// `fallbackSeed` is any string used to deterministically pick a placeholder
// gradient + initials, so the same product always shows the same placeholder.
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const PALETTES = [
  ['from-sage-200', 'to-champagne-200'],
  ['from-ivory-200', 'to-sage-200'],
  ['from-champagne-200', 'to-ivory-300'],
  ['from-ink-200', 'to-ivory-200'],
  ['from-sage-100', 'to-champagne-100'],
]

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'F'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export default function SafeImage({
  src,
  alt = '',
  fallbackSeed = '',
  className = '',
  imgClassName = '',
  showLabel = false,
}) {
  const [errored, setErrored] = useState(false)

  const showPlaceholder = !src || errored
  const seed = fallbackSeed || alt || 'florist'
  const palette = PALETTES[hashString(seed) % PALETTES.length]
  const initials = getInitials(alt)

  if (showPlaceholder) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative w-full h-full bg-gradient-to-br ${palette.join(' ')} flex items-center justify-center overflow-hidden ${className}`}
      >
        {/* faint botanical glyph as decoration */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07] text-ink-900"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            d="M50 10 C 30 30 30 60 50 90 C 70 60 70 30 50 10 Z M50 30 C 40 45 40 65 50 80"
            fill="currentColor"
          />
          <circle cx="50" cy="50" r="6" fill="currentColor" />
        </svg>
        <span className="relative font-display text-3xl md:text-5xl text-ink-900/40 select-none">
          {initials}
        </span>
        {showLabel && alt && (
          <span className="absolute bottom-2 left-2 right-2 text-[10px] tracking-widest uppercase text-ink-700/70 text-center truncate font-mono">
            {alt}
          </span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`${className} ${imgClassName}`}
    />
  )
}