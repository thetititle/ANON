'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.replace('/login'), 3100)
    return () => clearTimeout(t)
  }, [router])

  return (
    <main className={`${styles.page} ${styles.landingPage}`}>
      <div className={styles.landingCenter}>
        <div className={`${styles.logo} ${styles.landingLogo}`}>
          <h1 className={styles.title}>안온</h1>
          <p className={styles.hanja}>安溫</p>
        </div>
        <p className={`${styles.desc} ${styles.landingDesc}`}>소중한 분을 기억하는 공간</p>
      </div>
    </main>
  )
}
