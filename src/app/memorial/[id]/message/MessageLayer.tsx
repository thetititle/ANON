'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaHandPointer } from 'react-icons/fa'
import styles from './message.module.css'

const REPLAY_KEY_PREFIX = 'anon_message_replay_'
const TRANSITION_MS = 350

type Props = {
  memorialId: string
  salutation: string
  message: string
}

export default function MessageLayer({ memorialId, salutation, message }: Props) {
  const router = useRouter()
  const [replay, setReplay] = useState(true)
  const [leaving, setLeaving] = useState(false)

  function handleEnter() {
    if (leaving) return
    localStorage.setItem(`${REPLAY_KEY_PREFIX}${memorialId}`, String(replay))
    setLeaving(true)
    setTimeout(() => router.push(`/memorial/${memorialId}`), TRANSITION_MS)
  }

  return (
    <div className={`${styles.layer} ${leaving ? styles.leaving : ''}`} onClick={handleEnter}>
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
    </div>
  )
}
