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
  expand: <path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9" />,
  close:<path d="M4 4l8 8M12 4l-8 8" />,
  grip: <path d="M6 3.5v.01M10 3.5v.01M6 8v.01M10 8v.01M6 12.5v.01M10 12.5v.01" strokeWidth="2.2" />,
  sun: (
    <>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
    </>
  ),
  moon: <path d="M13 9.6A5.4 5.4 0 1 1 6.4 3a4.2 4.2 0 0 0 6.6 6.6z" />,
  // Mobile tab bar and touch actions: same square-cap stroke as the rest.
  timer: (
    <>
      <circle cx="8" cy="9" r="5.2" />
      <path d="M8 9V6.2M6.2 1.8h3.6" />
    </>
  ),
  list: <path d="M2 4h1.5M2 8h1.5M2 12h1.5M6 4h8M6 8h8M6 12h8" />,
  wave: <path d="M3 6.5v3M5.5 4.5v7M8 2.5v11M10.5 4.5v7M13 6.5v3" />,
  check: <path d="M3 8.5l3 3 7-7" />,
  trash: <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.8 6.5v4.5M9.2 6.5v4.5" />,
  plus: <path d="M8 2.5v11M2.5 8h11" />,
  more: (
    <>
      <path d="M3.2 8h.1M8 8h.1M12.7 8h.1" strokeWidth="2.4" />
    </>
  ),
  fullscreen: <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />,
  breathe: (
    <>
      <circle cx="8" cy="8" r="2" />
      <circle cx="8" cy="8" r="5.5" strokeDasharray="1.6 1.8" />
    </>
  ),
}

export type IconName = keyof typeof PATHS

export default function Icon({ name }: { name: IconName }): ReactNode {
  return (
    <svg className="ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter">
      {PATHS[name]}
    </svg>
  )
}
