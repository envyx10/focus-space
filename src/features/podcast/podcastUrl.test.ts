import { describe, expect, it } from 'vitest'
import { parsePodcastUrl } from './podcastUrl'

describe('parsePodcastUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42', 'youtube', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&iv_load_policy=3&enablejsapi=1'],
    ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'youtube', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&iv_load_policy=3&enablejsapi=1'],
    ['  https://m.youtube.com/live/dQw4w9WgXcQ  ', 'youtube', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&iv_load_policy=3&enablejsapi=1'],
    ['https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG', 'youtube', 'https://www.youtube-nocookie.com/embed/videoseries?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG&rel=0&iv_load_policy=3&enablejsapi=1'],
    ['https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk?si=x', 'spotify', 'https://open.spotify.com/embed/episode/4rOoJ6Egrf8K2IrywzwOMk'],
    ['https://open.spotify.com/intl-es/show/2MAi0BvDc6GTFvKFPXnkCL', 'spotify', 'https://open.spotify.com/embed/show/2MAi0BvDc6GTFvKFPXnkCL'],
    ['https://podcasts.apple.com/es/podcast/the-daily/id1200361736?i=1000650000000', 'apple', 'https://embed.podcasts.apple.com/es/podcast/the-daily/id1200361736?i=1000650000000'],
    ['https://podcasts.apple.com/us/podcast/the-daily/id1200361736', 'apple', 'https://embed.podcasts.apple.com/us/podcast/the-daily/id1200361736'],
  ])('accepts %s', (input, kind, src) => {
    expect(parsePodcastUrl(input)).toEqual({ kind, src })
  })

  it.each([
    '',
    'not a url',
    'http://www.youtube.com/watch?v=dQw4w9WgXcQ', // not https
    'javascript:alert(1)',
    'https://evil.com/watch?v=dQw4w9WgXcQ', // host not allowed
    'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
    'https://user:pass@www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com:8443/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/@channel',
    'https://open.spotify.com/track/4rOoJ6Egrf8K2IrywzwOMk', // a song, not a podcast
    'https://open.spotify.com/episode/../../x',
    'https://podcasts.apple.com/es/podcast/the-daily/id1200361736?i=1"onload=x',
    'https://podcasts.apple.com/es/browse',
  ])('rejects %s', (input) => {
    expect(parsePodcastUrl(input)).toBeNull()
  })
})
