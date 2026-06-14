'use client'

import { useRef, useState } from 'react'
import styles from './MediaUpload.module.css'

type MediaItem = {
  file: File
  url: string
  kind: 'image' | 'video'
  lowRes?: boolean
}

const MAX_IMAGES = 20
const MIN_IMAGE_WIDTH = 1080

type Props = {
  onComplete?: (files: File[]) => void
  onChange?: (files: File[]) => void
}

export default function MediaUpload({ onComplete, onChange }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const completedRef = useRef(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const next: MediaItem[] = []
    const existingImages = items.filter(i => i.kind === 'image').length
    const hasVideo = items.some(i => i.kind === 'video')

    for (const file of selected) {
      if (file.type.startsWith('image/')) {
        if (existingImages + next.filter(n => n.kind === 'image').length >= MAX_IMAGES) continue
        next.push({ file, url: URL.createObjectURL(file), kind: 'image' })
      } else if (file.type.startsWith('video/') && !hasVideo && !next.some(n => n.kind === 'video')) {
        next.push({ file, url: URL.createObjectURL(file), kind: 'video' })
      }
    }

    const updated = [...items, ...next]
    setItems(prev => [...prev, ...next])
    e.target.value = ''

    for (const item of next) {
      if (item.kind !== 'image') continue
      const img = new Image()
      img.onload = () => {
        if (img.naturalWidth < MIN_IMAGE_WIDTH) {
          setItems(prev => prev.map(i => i.url === item.url ? { ...i, lowRes: true } : i))
        }
      }
      img.src = item.url
    }

    if (next.length > 0) {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete?.(updated.map(i => i.file))
      } else {
        onChange?.(updated.map(i => i.file))
      }
    }
  }

  function remove(index: number) {
    setItems(prev => {
      URL.revokeObjectURL(prev[index].url)
      const next = prev.filter((_, i) => i !== index)
      onChange?.(next.map(i => i.file))
      return next
    })
  }

  const imageCount = items.filter(i => i.kind === 'image').length
  const hasLowRes = items.some(i => i.lowRes)

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleChange}
        className={styles.hidden}
      />
      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.actions}>
            <button className={styles.skip} onClick={() => onComplete?.([])}>건너뛰기</button>
            <button className={styles.trigger} onClick={() => inputRef.current?.click()}>
              사진 · 영상 추가
            </button>
          </div>
          <p className={styles.hint}>사진이 없으면 추모 페이지에 표시되지 않아요</p>
          <p className={styles.hint}>세로로 찍은 사진이 추모 페이지 화면에 가장 잘 어울려요</p>
        </div>
      ) : (
        <div className={styles.filled}>
          <div className={styles.grid}>
            {items.map((item, i) => (
              <div key={item.url} className={styles.thumb}>
                {item.kind === 'image' ? (
                  <img src={item.url} alt="" className={styles.media} />
                ) : (
                  <video src={item.url} className={styles.media} />
                )}
                <button className={styles.remove} onClick={() => remove(i)}>×</button>
              </div>
            ))}
            {imageCount < MAX_IMAGES && (
              <button className={styles.add} onClick={() => inputRef.current?.click()}>+</button>
            )}
          </div>
          <p className={styles.hint}>세로로 찍은 사진이 추모 페이지 화면에 가장 잘 어울려요</p>
          {hasLowRes && (
            <p className={styles.warning}>화질이 낮은 사진이 있어요. 추모 페이지에서 흐릿하게 보일 수 있어요</p>
          )}
        </div>
      )}
    </div>
  )
}
