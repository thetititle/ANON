'use client'

import { useEffect } from 'react'
import styles from './page.module.css'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className={styles.page}>
      <div className={styles.landingCenter}>
        <div className={styles.logo}>
          <h1 className={styles.title}>안온</h1>
          <p className={styles.hanja}>安溫</p>
        </div>
        <p className={styles.desc}>
          문제가 발생했어요.<br />
          잠시 후 다시 시도해주세요.
        </p>
        <button type="button" className={styles.newMemorialBtn} onClick={() => reset()}>
          다시 시도
        </button>
      </div>
    </main>
  )
}
