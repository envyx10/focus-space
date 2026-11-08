import { account } from './account'
import { focus } from './focus'
import { mobile } from './mobile'
import { settings } from './settings'
import { sound } from './sound'
import { tasks } from './tasks'

/**
 * Spanish is the source dictionary: every key lives here, and the English one must provide all of them.
 * Values are strings; `{name}` placeholders are filled by `t(key, { name })`.
 */
export const es = { ...focus, ...tasks, ...sound, ...account, ...settings, ...mobile }
