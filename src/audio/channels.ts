export type ChannelId = 'rain' | 'fire' | 'cafe' | 'wind'
export type Variant = { id: string; label: string; src: string }
export type Channel = { id: ChannelId; label: string; variants: Variant[] }

const v = (ch: ChannelId, id: string, label: string): Variant => ({ id, label, src: `/sounds/${ch}-${id}.mp3` })

export const CHANNELS: Channel[] = [
  {
    id: 'rain',
    label: 'Lluvia',
    variants: [v('rain', 'suave', 'Suave'), v('rain', 'ventana', 'Ventana'), v('rain', 'tormenta', 'Tormenta'), v('rain', 'tienda', 'Tienda')],
  },
  { id: 'fire', label: 'Fuego', variants: [v('fire', 'hoguera', 'Hoguera'), v('fire', 'chimenea', 'Chimenea')] },
  { id: 'cafe', label: 'Café', variants: [v('cafe', 'cafeteria', 'Cafetería'), v('cafe', 'biblioteca', 'Biblioteca')] },
  { id: 'wind', label: 'Viento', variants: [v('wind', 'suave', 'Suave'), v('wind', 'bosque', 'Bosque')] },
]

export const CHANNEL_IDS = CHANNELS.map((c) => c.id)

export function channel(id: ChannelId): Channel {
  return CHANNELS.find((c) => c.id === id)!
}

export function nextVariant(id: ChannelId, current: string): string {
  const vs = channel(id).variants
  const i = vs.findIndex((x) => x.id === current)
  return vs[(i + 1) % vs.length].id
}
