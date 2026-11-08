import { useState } from 'react'
import { askNotificationPermission } from '@/features/timer/alerts'
import { useT } from '@/i18n'

/** Turning notifications on asks the browser first; a refusal leaves them off and says why. */
export function useNotifyToggle(setNotify: (on: boolean) => void) {
  const t = useT()
  const [message, setMessage] = useState<string | null>(null)
  const toggle = async (on: boolean) => {
    if (!on) {
      setMessage(null)
      return setNotify(false)
    }
    const ok = await askNotificationPermission()
    setMessage(ok ? null : t('settings.notifyDenied'))
    setNotify(ok)
  }
  return { toggle, message }
}
