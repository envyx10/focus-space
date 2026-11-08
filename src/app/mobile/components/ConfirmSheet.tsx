import { useT } from '@/i18n'
import Sheet from './Sheet'

export type Confirmation = { ask: string; run: () => void }

type Props = {
  confirm: Confirmation | null
  onClose: () => void
}

/** Asks before throwing away a phase with time already spent: the phone's take on window.confirm(). */
export default function ConfirmSheet({ confirm, onClose }: Props) {
  const t = useT()
  return (
    <Sheet open={confirm !== null} onClose={onClose} title={confirm?.ask ?? ''} kicker={<span className="lbl">{t('m.confirmKicker')}</span>}>
      <p className="m-sheet-text">{t('m.confirmBody')}</p>
      <div className="m-sheet-buttons">
        <button className="m-btn" onClick={onClose}>
          {t('m.cancel')}
        </button>
        <button
          className="m-btn is-primary"
          onClick={() => {
            confirm?.run()
            onClose()
          }}
        >
          {t('m.continue')}
        </button>
      </div>
    </Sheet>
  )
}
