'use client'

import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import styles from './ChipSelect.module.css'
import CustomAlert from './CustomAlert'

type Option = {
  label: string
  icon?: string
}

type Props = {
  options: Option[]
  max?: number
  onComplete?: (value: string[]) => void
  onChange?: (value: string[]) => void
  confirmLabel?: string
}

export default function ChipSelect({ options, max = 1, onComplete, onChange, confirmLabel }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)
  const lastIndexRef = useRef<number>(-1)
  const completedRef = useRef(false)
  const confirmRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (confirmLabel && selected.length === 1) {
      requestAnimationFrame(() => confirmRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }))
    }
  }, [selected.length, confirmLabel])

  function toggle(label: string, index: number) {
    if (selected.includes(label)) {
      const next = selected.filter((s) => s !== label)
      setSelected(next)
      onChange?.(next)
    } else if (selected.length < max) {
      const next = [...selected, label]
      setSelected(next)
      onChange?.(next)

      if (swiperRef.current && lastIndexRef.current !== -1) {
        swiperRef.current.slideTo(index)
      }
      lastIndexRef.current = index

      if (!confirmLabel && !completedRef.current) {
        completedRef.current = true
        onComplete?.(next)
      }
    } else {
      setShowAlert(true)
    }
  }

  return (
    <>
      {showAlert && (
        <CustomAlert
          message={`최대 ${max}개까지만 선택할 수 있어요.`}
          buttons={[{ label: '확인', onClick: () => setShowAlert(false), variant: 'primary' }]}
        />
      )}
      <Swiper
      slidesPerView="auto"
      spaceBetween={10}
      className={styles.swiper}
      onSwiper={(swiper) => { swiperRef.current = swiper }}
    >
      {options.map(({ label, icon }, index) => (
        <SwiperSlide key={label} className={styles.slide}>
          <button
            className={`${styles.card} ${selected.includes(label) ? styles.selected : ''}`}
            onClick={() => toggle(label, index)}
          >
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.label}>{label}</span>
          </button>
        </SwiperSlide>
      ))}
    </Swiper>
      {confirmLabel && selected.length > 0 && (
        <div className={styles.footer} ref={confirmRef}>
          <button
            className={styles.confirm}
            onClick={() => {
              if (!completedRef.current) {
                completedRef.current = true
                setConfirmed(true)
                onComplete?.(selected)
              }
            }}
          >
            {confirmed ? '선택 완료' : confirmLabel}
          </button>
        </div>
      )}
    </>
  )
}
