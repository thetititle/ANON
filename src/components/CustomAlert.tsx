'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomAlert.module.css'

type Button = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

type Props = {
  message: string
  note?: string
  buttons: Button[]
}

export default function CustomAlert({ message, note, buttons }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const primaryBtn = dialogRef.current?.querySelector<HTMLButtonElement>(`.${styles.primary}`)
    primaryBtn?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const secondary = buttons.find(b => b.variant === 'secondary')
        secondary?.onClick()
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
        if (focusable.length === 0) return
        const current = focusable.indexOf(document.activeElement as HTMLButtonElement)
        if (e.key === 'ArrowRight') focusable[(current + 1) % focusable.length].focus()
        if (e.key === 'ArrowLeft') focusable[(current - 1 + focusable.length) % focusable.length].focus()
        return
      }

      if (e.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [buttons])

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog} ref={dialogRef}>
        <p className={styles.message}>{message}</p>
        {note && <p className={styles.note}>{note}</p>}
        <div className={styles.buttons}>
          {buttons.map((btn) => (
            <button
              key={btn.label}
              className={`${styles.button} ${btn.variant === 'secondary' ? styles.secondary : styles.primary}`}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
