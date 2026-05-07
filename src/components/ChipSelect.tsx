'use client'

import { useRef, useState } from 'react'
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
}

export default function ChipSelect({ options, max = 1 }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)
  const lastIndexRef = useRef<number>(-1)

  function toggle(label: string, index: number) {
    if (selected.includes(label)) {
      setSelected(selected.filter((s) => s !== label))
    } else if (selected.length < max) {
      setSelected([...selected, label])

      if (swiperRef.current && lastIndexRef.current !== -1) {
        swiperRef.current.slideTo(index)
      }
      lastIndexRef.current = index
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
    </>
  )
}
