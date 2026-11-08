import type { ReactNode } from 'react'

/** One group of settings: a quiet label, then rows. */
export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="set-group" aria-label={title}>
      <h3>{title}</h3>
      <div className="set-rows">{children}</div>
    </section>
  )
}

type MinutesProps = { label: string; value: number; limits: readonly [number, number]; onCommit: (v: number) => void }

/** A whole number typed in and clamped to its limits when the field is left. */
export function Minutes({ label, value, limits, onCommit }: MinutesProps) {
  return (
    <label className="set-row">
      <span>{label}</span>
      <input
        className="set-num"
        key={value}
        type="number"
        min={limits[0]}
        max={limits[1]}
        defaultValue={value}
        onBlur={(e) => {
          const n = Math.round(Number(e.target.value))
          // An emptied field is not 0 (which would clamp to the minimum): put the old value back.
          if (!e.target.value.trim() || !Number.isFinite(n)) {
            e.target.value = String(value)
            return
          }
          const clamped = Math.min(limits[1], Math.max(limits[0], n))
          if (clamped !== value) onCommit(clamped)
          else e.target.value = String(value)
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </label>
  )
}

type SwitchProps = { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (on: boolean) => void }

export function Switch({ label, hint, checked, disabled, onChange }: SwitchProps) {
  return (
    <label className={`set-row set-toggle${disabled ? ' is-off' : ''}`}>
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input className="set-switch" type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

type SegmentedProps<T extends string> = { label: string; options: readonly T[]; value: T; text: (option: T) => string; onChange: (option: T) => void }

/** A row of toggle buttons, one pressed. */
export function Segmented<T extends string>({ label, options, value, text, onChange }: SegmentedProps<T>) {
  return (
    <span className="set-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o} aria-pressed={value === o} onClick={() => onChange(o)}>
          {text(o)}
        </button>
      ))}
    </span>
  )
}
