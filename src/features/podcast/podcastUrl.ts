/** A pasted podcast link turned into an embed URL the app builds itself. */
export type PodcastEmbed = { kind: 'youtube' | 'spotify' | 'apple'; src: string }

const YT_ID = /^[\w-]{11}$/
const YT_LIST = /^[\w-]{10,64}$/
// No related videos from other channels, no annotations; enablejsapi lets the card hear play/pause.
const YT_PARAMS = 'rel=0&iv_load_policy=3&enablejsapi=1'
const YT_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com']

/**
 * Trust boundary: only https links to YouTube, Spotify or Apple Podcasts pass, and the iframe src is rebuilt
 * from the parts that matched (never the pasted string), so nothing else can end up framed.
 */
export function parsePodcastUrl(input: string): PodcastEmbed | null {
  let u: URL
  try {
    u = new URL(input.trim())
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return null
  const host = u.hostname.toLowerCase()
  const parts = u.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be' || YT_HOSTS.includes(host)) {
    const list = u.searchParams.get('list')
    const id = host === 'youtu.be' ? parts[0] : parts[0] === 'watch' ? u.searchParams.get('v') : ['live', 'embed', 'shorts'].includes(parts[0]) ? parts[1] : null
    if (id && YT_ID.test(id)) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?${YT_PARAMS}` }
    if (parts[0] === 'playlist' && list && YT_LIST.test(list)) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}&${YT_PARAMS}` }
    return null
  }

  if (host === 'open.spotify.com') {
    // Localised links carry an "intl-xx" segment first: open.spotify.com/intl-es/episode/<id>
    const [type, id] = parts[0]?.startsWith('intl-') ? parts.slice(1) : parts
    if ((type === 'episode' || type === 'show') && id && /^[A-Za-z0-9]{22}$/.test(id)) return { kind: 'spotify', src: `https://open.spotify.com/embed/${type}/${id}` }
    return null
  }

  if (host === 'podcasts.apple.com') {
    // podcasts.apple.com/<country>/podcast/<slug>/id<digits>[?i=<episode digits>]
    const [cc, podcast, slug, id] = parts
    if (!/^[a-z]{2}$/.test(cc ?? '') || podcast !== 'podcast' || !/^[\w%.-]+$/.test(slug ?? '') || !/^id\d+$/.test(id ?? '')) return null
    const ep = u.searchParams.get('i')
    if (ep !== null && !/^\d+$/.test(ep)) return null
    return { kind: 'apple', src: `https://embed.podcasts.apple.com/${cc}/podcast/${slug}/${id}${ep ? `?i=${ep}` : ''}` }
  }

  return null
}
