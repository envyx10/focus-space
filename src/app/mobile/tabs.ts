import type { Key } from '@/i18n'
import type { IconName } from '@/shared/ui/Icon'

/** Below this width the app mounts the mobile shell instead of the desktop grid (the desktop grid needs 1024 px). */
export const MOBILE_QUERY = '(max-width: 1023px)'

export const MOBILE_TABS = ['focus', 'tasks', 'sound', 'settings'] as const
export type MobileTab = (typeof MOBILE_TABS)[number]

export const TAB_ICON: Record<MobileTab, IconName> = { focus: 'timer', tasks: 'list', sound: 'wave', settings: 'gear' }
export const TAB_LABEL: Record<MobileTab, Key> = { focus: 'm.tab.focus', tasks: 'tabs.tasks', sound: 'tabs.mixer', settings: 'settings.title' }
