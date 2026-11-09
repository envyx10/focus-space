import { DEFAULT_ACCENT } from '@/features/prefs/accent'

export type SceneId =
  | 'hero'
  | 'f-timer'
  | 'f-tasks'
  | 'f-sound'
  | 'f-focus'
  | 'f-personal'
  | 'f-mobile'
  | 'rhythm'
  | 'breathe'
  | 'faq'
  | 'local'
  | 'details'
  | 'enter'

/**
 * Hand-off between the page and the app's sphere, read every frame.
 * shortcut: a module-level singleton, like the app's `breathing`: one sphere per page.
 */
export const field = {
  scene: 'hero' as SceneId,
  /** The breathing guide's breath, 0..1, while it runs: the sphere swells and empties with it. */
  breath: null as number | null,
  accent: DEFAULT_ACCENT as string,
}
