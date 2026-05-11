'use client'

import { useEffect, useRef, useState } from 'react'
import CustomAlert from './CustomAlert'
import styles from './FormInput.module.css'

type Props = {
  placeholder?: string
  isActive?: boolean
  onComplete?: (value: string) => void
  validate?: (value: string) => string | null
  confirm?: boolean
  transform?: (value: string) => string
}

export default function FormInput({ placeholder = '', isActive, onComplete, validate, confirm, transform }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    if (!isActive) return
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [isActive])

  function submit(v: string) {
    const err = validate?.(v) ?? null
    if (err) {
      setError(err)
      return
    }
    if (confirm) {
      setShowConfirm(true)
      return
    }
    completedRef.current = true
    onComplete?.(v)
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (completedRef.current) return
    const v = (inputRef.current?.value ?? '').trim()
    if (v) submit(v)
  }

  function reset() {
    setShowConfirm(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <>
{showConfirm && (
        <CustomAlert
          message={`${value}\n맞으신가요?`}
          note={confirm ? '잘못된 계좌번호로 인한 피해는 책임지지 않습니다.' : undefined}
          buttons={[
            { label: '다시 입력', onClick: reset, variant: 'secondary' },
            {
              label: '맞아요', variant: 'primary', onClick: () => {
                setShowConfirm(false)
                completedRef.current = true
                onComplete?.(value.trim())
              }
            },
          ]}
        />
      )}
      <form style={{ display: 'contents' }} onSubmit={handleSubmit}>
        <div className={styles.wrapper}>
          <div className={styles.field}>
            <div className={styles.sizer} data-value={value || placeholder}>
              <input
                ref={inputRef}
                type="text"
                size={1}
                placeholder={placeholder}
                value={value}
                onChange={(e) => { setValue(transform ? transform(e.target.value) : e.target.value); setError(null) }}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </form>
    </>
  )
}
