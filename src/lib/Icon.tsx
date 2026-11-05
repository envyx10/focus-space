import type { ReactNode } from 'react'

// Thin square-cap strokes in currentColor: they take the text colour of whatever button holds them,
// so no glyph is ever swapped for a grey system emoji on a phone.
const PATHS = {
  play: <path d="M5 3.5v9l7.5-4.5z" fill="currentColor" stroke="none" />,
  pause: <path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" fill="currentColor" stroke="none" />,
  skip: <path d="M3 3.5v9l6.5-4.5zM11 3.5h2v9h-2z" fill="currentColor" stroke="none" />,
  gear: (
    <>
      <path d="M2 5h6.5M12.5 5H14M2 11h1.5M7.5 11H14" />
      <circle cx="10.5" cy="5" r="1.8" />
      <circle cx="5.5" cy="11" r="1.8" />
    </>
  ),
  out: <path d="M5 11l6-6M5.5 5H11v5.5" />,
  user: <circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" />,
  refresh: <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" />,
  reset: <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3" />,
  prev: <path d="M10 3.5L5.5 8l4.5 4.5" />,
  next: <path d="M6 3.5L10.5 8 6 12.5" />,
  up: <path d="M3.5 10L8 5.5l4.5 4.5" />,
  down: <path d="M3.5 6L8 10.5 12.5 6" />,
  stop: <path d="M4.5 4.5h7v7h-7z" fill="currentColor" stroke="none" />,
  right: <path d="M2.5 8h10M9 4.5L12.5 8 9 11.5" />,
  edit: <path d="M3 13l.6-2.8 6.9-6.9 2.2 2.2-6.9 6.9zM9 4.8L11.2 7" />,
  sound: <path d="M2 6.5h2.5L8 3.5v9L4.5 9.5H2zM10.5 6a3 3 0 0 1 0 4M12.5 4a6 6 0 0 1 0 8" />,
  muted: <path d="M2 6.5h2.5L8 3.5v9L4.5 9.5H2zM10.5 6.5l3.5 3.5M14 6.5L10.5 10" />,
  close:<path d="M4 4l8 8M12 4l-8 8" />,
  sun: (
    <>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
    </>
  ),
  moon: <path d="M13 9.6A5.4 5.4 0 1 1 6.4 3a4.2 4.2 0 0 0 6.6 6.6z" />,
}

export type IconName = keyof typeof PATHS

export default function Icon({ name }: { name: IconName }): ReactNode {
  return (
    <svg className="ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter">
      {PATHS[name]}
    </svg>
  )
}
