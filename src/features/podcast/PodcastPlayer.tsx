import { useState, type FormEvent } from 'react'
import { useT } from '@/i18n'
import { parsePodcastUrl, type PodcastEmbed } from './podcastUrl'
import './podcast.css'

type Props = { url: string; onUrl: (url: string) => void }

// Spotify and Apple embeds have fixed heights; YouTube keeps its 16:9 video.
const height = (e: PodcastEmbed) => (e.kind === 'spotify' ? 352 : e.kind === 'apple' ? (e.src.includes('?i=') ? 175 : 450) : undefined)

/** A link field and, once a valid link is saved, the service's own embedded player (video included). */
export default function PodcastPlayer({ url, onUrl }: Props) {
  const t = useT()
  const embed = url ? parsePodcastUrl(url) : null
  const [editing, setEditing] = useState(!embed)
  const [draft, setDraft] = useState(url)
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!parsePodcastUrl(draft)) return setError(true)
    setError(false)
    setEditing(false)
    onUrl(draft.trim())
  }

  return (
    <div className="pod">
      {embed && !editing ? (
        <>
          <iframe
            key={embed.src}
            className={`pod-frame pod-${embed.kind}`}
            src={embed.src}
            height={height(embed)}
            title={t('podcast.frame')}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
            allowFullScreen
            // YouTube refuses to play embeds that send no referrer (error 153).
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <div className="pod-actions">
            <button onClick={() => setEditing(true)}>{t('podcast.change')}</button>
            <button
              onClick={() => {
                onUrl('')
                setDraft('')
                setEditing(true)
              }}
            >
              {t('podcast.remove')}
            </button>
          </div>
        </>
      ) : (
        <form className="pod-form" onSubmit={submit} noValidate>
          <input
            type="url"
            inputMode="url"
            value={draft}
            onChange={(e) => (setDraft(e.target.value), setError(false))}
            placeholder={t('podcast.placeholder')}
            aria-label={t('podcast.placeholder')}
            aria-invalid={error || undefined}
            aria-describedby={error ? 'pod-error' : undefined}
          />
          <button type="submit">{t('podcast.load')}</button>
          {error && (
            <p id="pod-error" className="pod-error" role="alert">
              {t('podcast.invalid')}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
