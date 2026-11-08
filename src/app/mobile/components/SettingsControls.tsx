import type { ReactNode } from 'react'
import { haptic } from '@/app/mobile/platform'
import { useT } from '@/i18n'

export function Group({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`m-group ${className}`.trim()} aria-label={title}>
      <h2 className="m-group-h">{title}</h2>
      <div className="m-rows">{children}</div>
    </section>
  )
}

type ToggleProps = { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (on: boolean) => void }

export function Toggle({ label, hint, checked, disabled, onChange }: ToggleProps) {
  return (
    <label className={`m-rowset m-toggle${disabled ? ' is-disabled' : ''}`}>
      <span className="m-rowset-label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input
        className="m-switch"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          haptic(6)
          onChange(e.target.checked)
        }}
      />
    </label>
  )
}

type StepperProps = { label: string; value: number; limits: readonly [number, number]; onCommit: (v: number) => void }

/** A whole number with − and + around it: typing digits on a phone is the slow path, so it is optional. */
export function Stepper({ label, value, limits, onCommit }: StepperProps) {
  const t = useT()
  const set = (v: number) => onCommit(Math.min(limits[1], Math.max(limits[0], v)))
  return (
    <div className="m-rowset">
      <span className="m-rowset-label">{label}</span>
      <span className="m-num" role="group" aria-label={label}>
        <button aria-label={t('m.less', { what: label })} disabled={value <= limits[0]} onClick={() => set(value - 1)}>
          −
        </button>
        <input
          key={value}
          type="number"
          inputMode="numeric"
          enterKeyHint="done"
          min={limits[0]}
          max={limits[1]}
          defaultValue={value}
          aria-label={label}
          onBlur={(e) => {
            const n = Math.round(Number(e.target.value))
            if (Number.isFinite(n) && n !== value) set(n)
            else e.target.value = String(value)
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <button aria-label={t('m.more', { what: label })} disabled={value >= limits[1]} onClick={() => set(value + 1)}>
          +
        </button>
      </span>
    </div>
  )
}

type SegProps<T extends string> = { label: string; options: { id: T; label: string }[]; value: T | null; onChange: (id: T) => void }

export function Seg<T extends string>({ label, options, value, onChange }: SegProps<T>) {
  return (
    <span className="m-seg is-small" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </span>
  )
}
