import { Fragment, type CSSProperties, type ElementType } from 'react'

type Props = {
  text: string
  as?: ElementType
  id?: string
  className?: string
  /** The words are animated by their section (scrubbed with the scroll) instead of the page-wide entrance. */
  manual?: boolean
}

/**
 * A headline split into words, each in its own mask, so it can rise line by line. Screen readers get the
 * sentence once, from the label, not word by word.
 */
export function Split({ text, as: Tag = 'h2', id, className = '', manual }: Props) {
  return (
    <Tag id={id} className={`split ${className}`} aria-label={text} data-manual={manual || undefined}>
      {text.split(' ').map((word, i) => (
        // the space sits between the masks: inside an inline-block it would collapse
        <Fragment key={i}>
          <span className="w" aria-hidden="true">
            <span style={{ '--i': i } as CSSProperties}>{word}</span>
          </span>{' '}
        </Fragment>
      ))}
    </Tag>
  )
}
