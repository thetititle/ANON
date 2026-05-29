'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './memorial.module.css'

export default function MemorialHeader({ isOwner }: { isOwner: boolean }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <header className={styles.memorialHeader}>
      <Link href="/" className={styles.homeLink}>안온</Link>
      <div className={styles.headerActions}>
        <button className={styles.shareBtn} onClick={handleShare}>
          {copied ? '복사됨' : '공유'}
        </button>
        {isOwner && (
          <Link href="/logout" className={styles.headerLogout}>로그아웃</Link>
        )}
      </div>
    </header>
  )
}
