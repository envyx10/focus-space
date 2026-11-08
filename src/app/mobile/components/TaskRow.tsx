import { useRef } from 'react'
import { haptic } from '@/app/mobile/platform'
import PriorityTag from '@/features/tasks/components/PriorityTag'
import type { Task } from '@/features/tasks/types'
import { useT } from '@/i18n'
import { pad2 } from '@/shared/lib/format'
import Icon from '@/shared/ui/Icon'

/** Keeps the gesture on this element even if the finger slides off it. A pointer that is already gone throws: ignore. */
const capture = (el: Element, id: number) => {
  try {
    el.setPointerCapture(id)
  } catch {
    // the pointer ended before the gesture locked
  }
}

// How far a row must travel before letting go acts (px), and the axis lock (px).
const ARM = 84
const LOCK = 8

type Props = {
  task: Task
  n: number
  onOpen: () => void
  onToggle: () => void
  onDelete: () => void
}

/** A task row. Swipe right to complete (or reopen), left to delete; tap opens the task. The number is the checkbox. */
export default function TaskRow({ task, n, onOpen, onToggle, onDelete }: Props) {
  const t = useT()
  const li = useRef<HTMLLIElement>(null)
  const fg = useRef<HTMLDivElement>(null)
  const g = useRef<{ x: number; y: number; id: number; locked: boolean; dx: number; armed: boolean } | null>(null)
  const swiped = useRef(false)

  const show = (dx: number) => {
    if (!fg.current || !li.current) return
    fg.current.style.transform = dx ? `translateX(${dx}px)` : ''
    li.current.dataset.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : ''
    li.current.dataset.armed = Math.abs(dx) >= ARM ? 'yes' : ''
  }
  const settle = () => {
    li.current?.classList.remove('is-swiping')
    show(0)
  }

  return (
    <li
      ref={li}
      className={`m-row${task.done ? ' is-done' : ''}${task.active && !task.done ? ' is-active' : ''}`}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        g.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: false, dx: 0, armed: false }
      }}
      onPointerMove={(e) => {
        const s = g.current
        if (!s || s.id !== e.pointerId) return
        const dx = e.clientX - s.x
        if (!s.locked) {
          const dy = Math.abs(e.clientY - s.y)
          if (dy > LOCK && dy > Math.abs(dx)) return void (g.current = null) // scrolling the list
          if (Math.abs(dx) < LOCK) return
          s.locked = true
          capture(e.currentTarget, e.pointerId)
          e.currentTarget.classList.add('is-swiping')
        }
        // 1:1 up to the arm point, then it resists
        const a = Math.abs(dx)
        s.dx = Math.sign(dx) * (a <= ARM ? a : ARM + (a - ARM) * 0.35)
        const armed = a >= ARM
        if (armed !== s.armed) {
          s.armed = armed
          if (armed) haptic(6)
        }
        show(s.dx)
      }}
      onPointerUp={() => {
        const s = g.current
        g.current = null
        if (!s?.locked) return
        swiped.current = true
        setTimeout(() => (swiped.current = false), 0)
        if (s.dx >= ARM) {
          settle()
          haptic(10)
          onToggle()
        } else if (s.dx <= -ARM) {
          li.current?.classList.add('is-leaving')
          show(-(li.current?.offsetWidth ?? 400))
          setTimeout(onDelete, 160)
        } else settle()
      }}
      onPointerCancel={() => {
        g.current = null
        settle()
      }}
    >
      <div className="m-row-bg" aria-hidden>
        <span className="m-row-bg-done">
          <Icon name="check" />
          {task.done ? t('tasks.markPending') : t('tasks.markDone')}
        </span>
        <span className="m-row-bg-del">
          {t('tasks.delete')}
          <Icon name="trash" />
        </span>
      </div>
      <div ref={fg} className="m-row-fg">
        <button
          data-check={task.id}
          className="m-check"
          role="checkbox"
          aria-checked={task.done}
          aria-label={t('tasks.complete', { text: task.text })}
          onClick={() => {
            if (swiped.current) return
            haptic(10)
            onToggle()
          }}
        >
          <span className="m-check-box">{task.done ? <Icon name="check" /> : pad2(n + 1)}</span>
        </button>
        <button className="m-row-main" onClick={() => !swiped.current && onOpen()} aria-label={t('m.openTask', { text: task.text })}>
          <span className="m-row-text">
            <PriorityTag priority={task.priority} />
            {task.text}
          </span>
          {((task.active && !task.done) || task.description?.trim()) && (
            <span className="m-row-meta">
              {task.active && !task.done && <span className="acc">{t('tasks.focus.statusNow')}</span>}
              {task.description?.trim() && <span>{t('tasks.focus.hasNotes')}</span>}
            </span>
          )}
        </button>
        <span className="m-row-chev" aria-hidden>
          <Icon name="next" />
        </span>
      </div>
    </li>
  )
}
