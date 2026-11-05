export type ChannelId = 'rain' | 'fire' | 'cafe' | 'wind' | 'keys' | 'water' | 'night' | 'birds' | 'thunder' | 'noise' | 'travel' | 'drone' | 'paper' | 'asmr'
/** Display names live in the i18n dictionaries: `channel.<id>` and `variant.<channel>.<id>`. */
export type Variant = { id: string; src: string }
export type Channel = { id: ChannelId; variants: Variant[] }

const channelOf = (id: ChannelId, variantIds: string[]): Channel => ({
  id,
  variants: variantIds.map((v) => ({ id: v, src: `/sounds/${id}-${v}.mp3` })),
})

export const CHANNELS: Channel[] = [
  channelOf('rain', ['suave', 'ventana', 'tormenta', 'tienda']),
  channelOf('fire', ['hoguera', 'chimenea']),
  channelOf('cafe', ['cafeteria', 'biblioteca']),
  channelOf('wind', ['suave', 'bosque']),
  channelOf('keys', ['azul', 'azul2', 'marron', 'marron2', 'rojo']),
  channelOf('water', ['olas', 'arroyo', 'rio', 'fuente']),
  channelOf('night', ['grillos', 'selva']),
  channelOf('birds', ['amanecer', 'primavera']),
  channelOf('thunder', ['lejano']),
  channelOf('noise', ['blanco', 'rosa', 'marron']),
  channelOf('travel', ['tren', 'avion']),
  channelOf('drone', ['cuenco', 'espacio']),
  channelOf('paper', ['lapiz', 'paginas']),
  channelOf('asmr', ['tapping', 'cepillo', 'plastico', 'ronroneo']),
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
