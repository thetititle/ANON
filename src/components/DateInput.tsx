'use client'

import { useEffect, useRef, useState } from 'react'
import CustomAlert from './CustomAlert'
import styles from './DateInput.module.css'

type Props = {
  isActive?: boolean
  onComplete?: (value: string) => void
  minDate?: string
}

function validateDate(y: string, m: string, d: string, minDate?: string): string | null {
  const year = parseInt(y)
  const month = parseInt(m)
  const day = parseInt(d)
  const currentYear = new Date().getFullYear()

  if (year < 1900 || year > currentYear) return `연도는 1900~${currentYear} 사이로 입력해주세요.`
  if (month < 1 || month > 12) return '월은 1~12 사이로 입력해주세요.'
  const maxDay = new Date(year, month, 0).getDate()
  if (day < 1 || day > maxDay) return `${month}월은 최대 ${maxDay}일까지 있어요.`
  if (minDate) {
    const entered = new Date(year, month - 1, day)
    const min = new Date(minDate)
    if (entered <= min) return '사망일은 생년월일 이후여야 합니다.'
  }
  return null
}

export default function DateInput({ isActive, onComplete, minDate }: Props) {
  const [year, setYear]   = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay]     = useState('')
  const [alertState, setAlertState] = useState<'confirm' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

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
    if (v.length === 2) {
      const err = validateDate(year, month, v, minDate)
      if (err) {
        setErrorMsg(err)
        setAlertState('error')
      } else {
        setAlertState('confirm')
      }
    }
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
    setAlertState(null)
    setTimeout(() => yearRef.current?.focus(), 0)
  }

  return (
    <>
      {alertState === 'confirm' && (
        <CustomAlert
          message={`${year}년 ${month}월 ${day}일\n맞으신가요?`}
          buttons={[
            { label: '다시 입력', onClick: reset, variant: 'secondary' },
            { label: '맞아요', onClick: () => { setAlertState(null); onComplete?.(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`) }, variant: 'primary' },
          ]}
        />
      )}
      {alertState === 'error' && (
        <CustomAlert
          message={errorMsg}
          buttons={[
            { label: '다시 입력', onClick: reset, variant: 'primary' },
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
