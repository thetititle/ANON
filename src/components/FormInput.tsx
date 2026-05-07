'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './FormInput.module.css'

type Props = {
  placeholder?: string
  isActive?: boolean
  onComplete?: () => void
}

export default function FormInput({ placeholder = '', isActive, onComplete }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    if (!isActive) return
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [isActive])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim() && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.sizer} data-value={value || placeholder}>
        <input
          ref={inputRef}
          type="text"
          size={1}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
        />
      </div>
    </div>
  )
}
