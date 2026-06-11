'use client'

import { useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import styles from './memorial.module.css'

type Props = {
  portrait: React.ReactNode
  messages: React.ReactNode
}

export default function MemorialSwiper({ portrait, messages }: Props) {
  useEffect(() => {
    const html = document.documentElement
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <Swiper
      modules={[Pagination, Mousewheel]}
      direction="vertical"
      slidesPerView={1}
      speed={800}
      mousewheel={{ releaseOnEdges: true }}
      pagination={{ clickable: true }}
      className={styles.pageSwiper}
    >
      <SwiperSlide className={styles.pageSlide}>
        <main className={`${styles.page} ${styles.portraitPage}`}>{portrait}</main>
      </SwiperSlide>
      <SwiperSlide className={styles.pageSlide}>
        <main className={`${styles.page} ${styles.messagesPage}`}>{messages}</main>
      </SwiperSlide>
    </Swiper>
  )
}
