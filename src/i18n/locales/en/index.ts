import type { Key } from '@/i18n'
import { account } from './account'
import { focus } from './focus'
import { mobile } from './mobile'
import { settings } from './settings'
import { sound } from './sound'
import { tasks } from './tasks'

export const en: Record<Key, string> = { ...focus, ...tasks, ...sound, ...account, ...settings, ...mobile }
