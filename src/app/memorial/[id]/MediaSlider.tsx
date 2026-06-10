'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
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
      modules={[Autoplay, EffectFade]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      speed={2000}
      autoplay={{ delay: 6000, disableOnInteraction: false }}
      loop={media.length > 1}
      spaceBetween={0}
      slidesPerView={1}
      nested
      className={styles.slider}
    >
      {media.map((item) => (
        <SwiperSlide key={item.id}>
          <div className={styles.mediaWrapper}>
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
            <div className={styles.mediaTint} aria-hidden="true" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
