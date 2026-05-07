'use client'

import { useEffect, useRef, useState } from 'react'
import CustomAlert from './CustomAlert'
import styles from './DateInput.module.css'

type Props = {
  isActive?: boolean
  onComplete?: () => void
}

export default function DateInput({ isActive, onComplete }: Props) {
  const [year, setYear]   = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay]     = useState('')
  const [showAlert, setShowAlert] = useState(false)

  const yearRef  = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const dayRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isActive) return
    const raf = requestAnimationFrame(() => yearRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [isActive])

  function onlyNumeric(value: string, max: number) {
    return value.replace(/\D/g, '').slice(0, max)
  }

  function handleYear(value: string) {
    const v = onlyNumeric(value, 4)
    setYear(v)
    if (v.length === 4) monthRef.current?.focus()
  }

  function handleMonth(value: string) {
    const v = onlyNumeric(value, 2)
    setMonth(v)
    if (v.length === 2) dayRef.current?.focus()
  }

  function handleDay(value: string) {
    const v = onlyNumeric(value, 2)
    setDay(v)
    if (v.length === 2) setShowAlert(true)
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    current: 'month' | 'day'
  ) {
    if (e.key === 'Backspace') {
      if (current === 'month' && month === '') yearRef.current?.focus()
      if (current === 'day' && day === '') monthRef.current?.focus()
    }
  }

  function reset() {
    setYear('')
    setMonth('')
    setDay('')
    setShowAlert(false)
    setTimeout(() => yearRef.current?.focus(), 0)
  }

  return (
    <>
      {showAlert && (
        <CustomAlert
          message={`${year}년 ${month}월 ${day}일\n맞으신가요?`}
          buttons={[
            { label: '다시 입력', onClick: reset, variant: 'secondary' },
            { label: '맞아요', onClick: () => { setShowAlert(false); onComplete?.() }, variant: 'primary' },
          ]}
        />
      )}
      <div className={styles.wrapper}>
        <div className={styles.group}>
          <div className={styles.unit}>
            <div className={styles.sizer} data-value={year || 'YYYY'}>
              <input
                ref={yearRef}
                size={1}
                type="text"
                inputMode="numeric"
                placeholder="YYYY"
                maxLength={4}
                value={year}
                onChange={(e) => handleYear(e.target.value)}
                className={styles.input}
              />
            </div>
            <span className={styles.separator}>년</span>
          </div>
          <div className={styles.unit}>
            <div className={styles.sizer} data-value={month || 'MM'}>
              <input
                ref={monthRef}
                size={1}
                type="text"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                value={month}
                onChange={(e) => handleMonth(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'month')}
                className={styles.input}
              />
            </div>
            <span className={styles.separator}>월</span>
          </div>
          <div className={styles.unit}>
            <div className={styles.sizer} data-value={day || 'DD'}>
              <input
                ref={dayRef}
                size={1}
                type="text"
                inputMode="numeric"
                placeholder="DD"
                maxLength={2}
                value={day}
                onChange={(e) => handleDay(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'day')}
                className={styles.input}
              />
            </div>
            <span className={styles.separator}>일</span>
          </div>
        </div>
      </div>
    </>
  )
}
