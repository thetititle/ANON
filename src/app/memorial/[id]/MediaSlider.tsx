'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import styles from './memorial.module.css'

type Media = {
  id: string
  url: string
  type: string
  order: number
}

export default function MediaSlider({ media }: { media: Media[] }) {
  return (
    <Swiper
      modules={[Pagination]}
      pagination={{ clickable: true }}
      spaceBetween={0}
      slidesPerView={1}
      className={styles.slider}
    >
      {media.map((item) => (
        <SwiperSlide key={item.id}>
          {item.type === 'video' ? (
            <video
              src={item.url}
              controls
              className={styles.mediaItem}
              playsInline
            />
          ) : (
            <img
              src={item.url}
              alt=""
              className={styles.mediaItem}
            />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
