'use client'

import { useRef, useState } from 'react'
import styles from './MediaUpload.module.css'

type MediaItem = {
  file: File
  url: string
  kind: 'image' | 'video'
}

const MAX_IMAGES = 20

type Props = {
  onComplete?: (files: File[]) => void
}

export default function MediaUpload({ onComplete }: Props) {
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

    if (next.length > 0 && !completedRef.current) {
      completedRef.current = true
      onComplete?.(updated.map(i => i.file))
    }
  }

  function remove(index: number) {
    setItems(prev => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const imageCount = items.filter(i => i.kind === 'image').length

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
        </div>
      ) : (
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
      )}
    </div>
  )
}
