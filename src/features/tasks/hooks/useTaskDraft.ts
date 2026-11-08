import { useEffect, useState } from 'react'

const DRAFT_KEY = 'focus-space:tasks:draft'

const readDraft = () => {
  try {
    return localStorage.getItem(DRAFT_KEY) ?? ''
  } catch {
    return ''
  }
}

/** The new-task box's text, kept in storage: a half-typed task survives a reload or a closed tab. */
export function useTaskDraft(): [string, (v: string) => void] {
  const [draft, setDraft] = useState(readDraft)
  useEffect(() => {
    try {
      if (draft) localStorage.setItem(DRAFT_KEY, draft)
      else localStorage.removeItem(DRAFT_KEY)
    } catch {
      // storage blocked: the draft just lives in memory
    }
  }, [draft])
  return [draft, setDraft]
}
