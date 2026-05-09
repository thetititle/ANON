'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './SearchSelect.module.css'

type Option = {
  label: string
  aliases?: string[]
  note?: string
}

type Props = {
  options: Option[]
  placeholder?: string
  isActive?: boolean
  onComplete?: (value: string) => void
}

export default function SearchSelect({ options, placeholder = '검색', isActive, onComplete }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    if (!isActive) return
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
      setOpen(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [isActive])

  useEffect(() => {
    if (!open || !wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
  }, [open, query])

  const q = query.trim()
  const filtered = q
    ? options.filter(o =>
        o.label.includes(q) || o.aliases?.some(a => a.includes(q))
      )
    : []

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [query])

  useEffect(() => {
    if (highlightedIndex < 0) return
    const item = listRef.current?.children[highlightedIndex] as HTMLElement
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex])

  function select(label: string) {
    setSelected(label)
    setQuery(label)
    setOpen(false)
    setHighlightedIndex(-1)
    if (!completedRef.current) {
      completedRef.current = true
      onComplete?.(label)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' && open && filtered.length > 0) {
      e.preventDefault()
      setHighlightedIndex(prev => (prev + 1) % filtered.length)
    } else if (e.key === 'ArrowUp' && open && filtered.length > 0) {
      e.preventDefault()
      setHighlightedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      if (highlightedIndex >= 0 && filtered.length > 0) {
        e.preventDefault()
        select(filtered[highlightedIndex].label)
      } else {
        const exact = filtered.find(o => o.label === q)
        if (exact) { e.preventDefault(); select(exact.label) }
        else if (filtered.length === 1) { e.preventDefault(); select(filtered[0].label) }
      }
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setSelected('') }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`${styles.input} ${selected ? styles.done : ''}`}
      />
      {open && filtered.length > 0 && dropdownPos && (
        <ul
          className={styles.list}
          ref={listRef}
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, width: 200 }}
        >
          {filtered.map((o, i) => (
            <li
              key={o.label}
              className={`${styles.item} ${i === highlightedIndex ? styles.highlighted : ''}`}
              onMouseDown={() => select(o.label)}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              <span>{o.label}</span>
              {o.note && <span className={styles.note}>{o.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
