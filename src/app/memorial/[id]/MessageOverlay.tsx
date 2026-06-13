'use client'

import { useLayoutEffect, useMemo, useState } from 'react'
import { FaHandPointer } from 'react-icons/fa'
import styles from './messageOverlay.module.css'

const REPLAY_KEY_PREFIX = 'anon_message_replay_'
const DISSOLVE_MS = 1350
const PARTICLE_COUNT = 36

type Props = {
  memorialId: string
  salutation: string
  message: string
  isLightTheme: boolean
}

export default function MessageOverlay({ memorialId, salutation, message, isLightTheme }: Props) {
  const [removed, setRemoved] = useState(false)
  const [dissolving, setDissolving] = useState(false)
  const [replay, setReplay] = useState(true)

  useLayoutEffect(() => {
    if (localStorage.getItem(`${REPLAY_KEY_PREFIX}${memorialId}`) === 'false') {
      setRemoved(true)
    }
  }, [memorialId])

  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.3,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80 - 30,
    })),
    []
  )

  function handleEnter() {
    if (dissolving) return
    localStorage.setItem(`${REPLAY_KEY_PREFIX}${memorialId}`, String(replay))
    setDissolving(true)
    setTimeout(() => setRemoved(true), DISSOLVE_MS)
  }

  if (removed) return null

  return (
    <div
      className={`${styles.overlay} ${isLightTheme ? styles.overlayLight : ''} ${dissolving ? styles.dissolving : ''}`}
      onClick={handleEnter}
    >
      <div className={styles.content}>
        {salutation && <p className={styles.salutation}>{salutation}</p>}
        <p className={styles.message}>{message}</p>
      </div>

      <div className={styles.tapHint} aria-hidden="true">
        <FaHandPointer className={styles.tapIcon} />
        <div className={styles.tapRippleWrap}>
          <span className={styles.tapRing} />
          <span className={styles.tapRing} />
        </div>
      </div>

      <div className={styles.toggleRow} onClick={(e) => e.stopPropagation()}>
        <span className={styles.toggleLabel}>다음에도 이 메시지 보기</span>
        <button
          type="button"
          role="switch"
          aria-checked={replay}
          className={`${styles.switch} ${replay ? styles.switchOn : ''}`}
          onClick={() => setReplay((r) => !r)}
        >
          <span className={styles.switchThumb} />
        </button>
      </div>

      {dissolving && (
        <div className={styles.particles} aria-hidden="true">
          {particles.map((p, i) => (
            <span
              key={i}
              className={styles.particle}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  )
}
